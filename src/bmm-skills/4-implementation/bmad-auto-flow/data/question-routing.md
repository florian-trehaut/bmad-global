# Question Routing — Orchestrator-Side Protocol

**Loaded by:** `bmad-auto-flow/steps/step-04-team-create.md` onwards. Defines the orchestrator's batching policy for `question` SendMessage payloads coming from teammates, the AskUserQuestion presentation format, and the reply routing back to teammates via SendMessage.

This protocol implements TAC-23 (batching: N=3 OR T=30s OR URGENT), TAC-24 (block teammates until reply), and TAC-27 (serialize SendMessage handling — single-threaded queue).

---

## State variables

The orchestrator maintains the following state across the lifecycle of a single auto-flow run:

| Variable | Type | Initial | Description |
|----------|------|---------|-------------|
| `QUESTION_BUFFER` | list of records | `[]` | Pending questions waiting for flush |
| `BUFFER_FIRST_TIMESTAMP` | datetime / null | `null` | Timestamp of the first un-flushed question (used for the 30s timer) |
| `MESSAGE_QUEUE` | list of records | `[]` | All inbound SendMessage payloads (questions, tracker_write_request, phase_complete, blocker), processed in arrival order |
| `PENDING_QUESTION_REPLIES` | map<question_id, teammate_task_id> | `{}` | Maps question_id to the teammate that emitted it, for reply routing |

---

## Ordering invariant (TAC-27)

**Single-threaded queue.** The orchestrator processes inbound SendMessage payloads in **arrival order** (per the `received_at` timestamp from the platform). It MUST NOT reorder, parallelize, or interleave handling of multiple messages.

```
For each inbound SendMessage `msg`:
  1. Append `msg` to MESSAGE_QUEUE (preserving arrival order)
  2. Process the FIRST unprocessed message in MESSAGE_QUEUE
  3. Loop until MESSAGE_QUEUE has no unprocessed messages
```

**Why this matters:** without serialization, two near-simultaneous `tracker_write_request` payloads could reach the tracker in non-deterministic order, producing inconsistent state. Single-threaded processing eliminates the race.

**Implementation contract:** the orchestrator step files describe the queue processing as a sequential pseudo-loop — Claude Code's tool calls are inherently serial within a turn, so the "single-threaded" property is preserved by construction. The protocol documents this so that future implementations (e.g., parallelized variants) cannot bypass the invariant by design.

---

## Per-message-type handling

When the orchestrator processes the next message in the queue, it dispatches based on `type:`:

### `type: question` (from teammate, asking the user)

```
1. Validate the payload structure (required keys: type, task_id, question_id, text, options).
   - On invalid structure → REJECT (do NOT batch). Send a `blocker` SendMessage back to the teammate citing the format violation.
2. Append the question to QUESTION_BUFFER:
   QUESTION_BUFFER.append({
     question_id: msg.question_id,
     teammate_task_id: msg.task_id,
     text: msg.text,
     options: msg.options,
     urgent: msg.urgent || false,
     context: msg.context || null,
     received_at: now()
   })
3. Record PENDING_QUESTION_REPLIES[msg.question_id] = msg.task_id
4. If QUESTION_BUFFER was empty before this append, set BUFFER_FIRST_TIMESTAMP = now()
5. Check flush conditions:
   - If msg.urgent == true → FLUSH NOW
   - Else if len(QUESTION_BUFFER) >= 3 → FLUSH NOW
   - Else if BUFFER_FIRST_TIMESTAMP is set AND (now() - BUFFER_FIRST_TIMESTAMP) >= 30 seconds → FLUSH NOW
   - Else → continue (wait for more messages or for the timer to fire)
```

### `type: tracker_write_request` (from teammate)

```
1. Validate operation is in the allowed set: create_issue | update_status | update_description | comment | label_add | label_remove | create_mr.
   - On invalid operation → REJECT, send `tracker_write_ack` with status=failed.
2. Apply the corresponding tracker-crud operation per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md` (or for file-based tracker: edit the story file's frontmatter).
3. Send `tracker_write_ack` SendMessage back to the teammate with status=ok|failed and any returned data (e.g., MR_IID for create_mr).
```

### `type: phase_complete` (from teammate)

```
1. Store the deliverable in PHASE_RESULTS[parent_phase][role] = msg.deliverable.
2. If the phase has multiple expected teammates (e.g., code-review with N teammates), wait until all expected `phase_complete` messages have arrived.
3. Once all teammates of the phase have reported:
   - Aggregate verdicts (per `team-workflows/team-config.md` consensus rules).
   - If verdict requires user input (FINDINGS for review/code-review, FAIL for validation) → present `[R]/[F]/[A]` menu via AskUserQuestion (TAC-13, TAC-25).
   - Else → transition tracker per phase (e.g., review → reviewed, dev → review, code-review → ready-for-merge, validation PASS → done).
4. Proceed to next step file.
```

### `type: blocker` (from teammate)

```
1. Capture the blocker context (reason, evidence, recovery_options).
2. Halt the current phase.
3. Present to the user via AskUserQuestion with `recovery_options` from the payload.
4. On user choice:
   - [R]etry → re-spawn the same role's teammate(s) with the same task contract
   - [F]ix manually → HALT auto-flow, present the worktree path and current tracker state, instruct the user to fix manually then re-invoke /bmad-auto-flow with --resume (NOTE: resume not supported per OOS-2; instead, the user takes ownership)
   - [A]bandon → proceed to step-09-finalize (cleanup), close the auto-flow with the issue parked in current tracker state
```

---

## Flush procedure

When a flush is triggered (via the conditions in `type: question` step 5), the orchestrator:

```
1. Construct a multi-question AskUserQuestion call with one entry per question in QUESTION_BUFFER:
   {
     questions: [
       {
         id: q.question_id,
         from: "Teammate {q.teammate_task_id}",
         text: q.text,
         options: q.options,
         context: q.context
       }
       for q in QUESTION_BUFFER
     ]
   }
2. Display to the user (in COMMUNICATION_LANGUAGE):
   ----------
   N teammates are waiting on user input. Please answer each:

   1. [Teammate {task_id}]: {text}
      Context: {context}
      [A] {option_A_label}
      [B] {option_B_label}

   2. [Teammate {task_id}]: ...

   (Press any single letter from the corresponding question to answer that question; you can answer all N in one message.)
   ----------
3. Receive user reply (one reply per question_id).
4. For EACH question reply, emit a SendMessage to the teammate identified by PENDING_QUESTION_REPLIES[question_id]:
   {
     type: question_reply,
     question_id: <id>,
     choice: <user's choice>
   }
5. Clear QUESTION_BUFFER and BUFFER_FIRST_TIMESTAMP.
6. Clear processed entries from PENDING_QUESTION_REPLIES.
```

If a teammate emits a question while the orchestrator is mid-flush (e.g., still waiting for the user's response on the previous batch), the new question is queued in MESSAGE_QUEUE and processed only AFTER the current flush completes. This preserves the serialization invariant (TAC-27) and prevents flush-during-flush deadlocks (Risk-5 — handled by appending URGENT-tagged questions to the buffer for the NEXT flush, not interrupting the current one).

---

## URGENT tag handling

A teammate may set `urgent: true` on a question. This signals that the question is blocking critical phase progress and should be flushed without waiting for the N=3 / T=30s thresholds.

**Behavior:**
- If the buffer is empty and an URGENT question arrives → flush immediately (single-question flush).
- If the buffer is non-empty and an URGENT question arrives → flush immediately, including the URGENT question + any buffered questions.
- If a flush is already in progress (waiting for user input) → the URGENT question is queued; it will be in the NEXT flush (which fires immediately after the current one completes per the standard rules).

URGENT is for genuine blockers (e.g., "the spec says X but the code says Y, which is correct?"). Overuse of URGENT defeats batching; teammates should reserve it for cases where ANY delay is harmful.

---

## Backpressure / timeout

Per TAC-14, if no SendMessage from any teammate of the current phase arrives within `agent_teams.phase_timeout_minutes` (default 30 min), the orchestrator triggers the timeout handler:

```
1. Halt the phase.
2. Present `[R]etry / [N]udge teammate / [A]bandon` via AskUserQuestion.
3. On [R] → re-spawn (TaskDelete + TaskCreate)
4. On [N] → emit a `nudge` SendMessage to the teammate with reminder to emit a phase_complete or blocker; reset the timeout
5. On [A] → proceed to step-09-finalize
```

The timeout is wall-clock from the most recent SendMessage of the phase (not from spawn time) — this avoids false timeouts on long-running but progressing teammates.

---

## Failure modes

| Mode | Detection | Handling |
|------|-----------|----------|
| Malformed SendMessage payload | YAML parse error or missing required keys | REJECT — send `blocker` back to teammate with format error description; do NOT batch |
| Unknown `type:` value | Type not in `{question, tracker_write_request, phase_complete, blocker, question_reply, tracker_write_ack, nudge}` | REJECT per `no-fallback-no-false-data.md` — do not silently route as "best guess" |
| Missing `task_id` correlation | tracker_write_ack or question_reply with no matching pending request | LOG + ignore; this indicates a teammate bug or a stale message from a deleted teammate |
| Reply to question_id not in PENDING_QUESTION_REPLIES | The user answered a question that was already answered or expired | LOG warning, do not forward |

All rejections happen at the orchestrator side. The teammate's expected behavior on rejection is to HALT (per `teammate-mode-routing.md`) — there is no retry-on-format-error fallback.
