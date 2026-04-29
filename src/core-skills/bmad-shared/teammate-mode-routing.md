# Teammate Mode Routing — Shared Rule

**Loaded by:** Every BMAD workflow's INITIALIZATION section, after `team-router.md`. Auto-detects whether the workflow is being executed inside an Agent Teams teammate context (versus a standalone user-driven session) and configures the workflow to reroute interactivity, defer tracker writes, reuse a provided worktree, and emit a structured final report instead of returning silently.

This rule operationalizes the BAC-4 / BAC-8 / TAC-15 / TAC-16 / TAC-17 / TAC-18 / TAC-19 / TAC-20 / TAC-30 contract of story `auto-flow-orchestrator`, and amends Decision D16 of `spec-agent-teams-integration.md` per `orchestrator-registry.md` (registered orchestrators only).

---

## Why this exists

Without explicit rerouting, sub-workflows running inside a teammate context fail in two ways:

1. **`AskUserQuestion` silently fails** — there is no TTY in the teammate session, so any interactive prompt blocks indefinitely or throws an opaque error (validated via [Mehmet Öner Yalçın research](https://oneryalcin.medium.com/when-claude-cant-ask-building-interactive-tools-for-the-agent-sdk-64ccc89558fa)).
2. **Tracker writes from teammates conflict with the orchestrator** — if both the lead and a teammate transition the same issue concurrently, the tracker state becomes ambiguous. BAC-8 mandates that the orchestrator be the **sole writer** of tracker state during auto-flow execution.

This rule replaces those two failure modes with structured `SendMessage(lead)` payloads that the orchestrator handles deterministically.

---

## Detection

Apply this detection at the END of INITIALIZATION (after `team-router.md`, after knowledge files have been loaded, before the first step file is loaded):

### 1. Look for a task contract

When a workflow is invoked by Agent Teams (via TaskCreate), the spawn prompt embeds a `task_contract:` YAML block. Detect its presence:

```
TEAMMATE_MODE = (the spawn prompt or the originating message contains a `task_contract:` YAML block as a top-level key)
```

If no such block is present → `TEAMMATE_MODE = false`. The workflow runs standalone (the default behavior). Skip the rest of this rule.

If present → continue to step 2.

### 2. Validate orchestrator authorization (HALT-eligible)

Parse the YAML block. Read these fields:

- `task_contract.metadata.orchestrator_invoked` (boolean, optional, default `false`)
- `task_contract.metadata.orchestrator_skill` (string, optional)
- `task_contract.metadata.parent_phase` (string, optional)

Authorization rules:

| `orchestrator_invoked` | `orchestrator_skill` | Skill in `orchestrator-registry.md`? | Outcome |
|------------------------|----------------------|--------------------------------------|---------|
| `false` or absent | (any) | (any) | TEAMMATE_MODE=true with `ORCH_AUTHORIZED=false` (perspectives/contracts only — D16 strict applies). Skill MUST refuse to load any top-level workflow.md. |
| `true` | absent or empty | — | HALT (see "HALT messages" in `orchestrator-registry.md`) |
| `true` | present | NO | HALT (see "HALT messages" in `orchestrator-registry.md`) |
| `true` | present | YES | TEAMMATE_MODE=true with `ORCH_AUTHORIZED=true` (skill may execute top-level workflows). |

The HALT must occur at INITIALIZATION end — before any step file loads. The teammate emits a SendMessage to the lead with the HALT reason and exits.

### 3. Set runtime flags

If TEAMMATE_MODE=true, set the following variables for the rest of the workflow execution:

| Variable | Source | Purpose |
|----------|--------|---------|
| `TEAMMATE_MODE` | this rule | Boolean. Used by every interactive step to branch on "ask user vs send to lead". |
| `ORCH_AUTHORIZED` | this rule | Boolean. If false, the skill MUST refuse to execute top-level workflows (D16 strict). |
| `LEAD_NAME` | `task_contract.deliverable.send_to` | Identifier passed to every `SendMessage` call. |
| `TASK_ID` | `task_contract.task_id` | Tag added to every `SendMessage` for correlation. |
| `WORKTREE_PATH` (if provided) | `task_contract.constraints.worktree_path` | If non-null, consumed by the worktree-lifecycle protocol (Branch D). |
| `TRACKER_WRITES_ENABLED` | `task_contract.constraints.tracker_writes` (default `false` in TEAMMATE_MODE) | Gate on every tracker mutation. |

---

## Behavior in TEAMMATE_MODE

When TEAMMATE_MODE=true, the workflow's runtime behavior changes as follows. Each change is enforced by the corresponding shared rule or step file logic.

### A. Reroute `AskUserQuestion` → `SendMessage(LEAD_NAME)` (TAC-15, TAC-16)

Every step that would otherwise call `AskUserQuestion` (for user input, for choice selection, for confirmation) MUST instead emit:

```yaml
# SendMessage payload — type: question
type: question
task_id: '{TASK_ID}'
question_id: '{unique-id-for-correlation}'
text: '{the question text}'
options:
  - key: '{single-letter-or-short-key}'
    label: '{human-readable label}'
urgent: false   # set to true only for blockers; orchestrator flushes immediately
context: |
  {optional 2-3 sentence context if the lead doesn't have it}
```

The teammate then **blocks until** a corresponding SendMessage reply arrives with matching `question_id`. The reply payload:

```yaml
type: question_reply
question_id: '{matching-id}'
choice: '{key the user selected}'
```

The teammate resumes execution as if the user had answered. **Forbidden** (TAC-18 unwanted-pattern HALT trigger): calling `AskUserQuestion` directly while TEAMMATE_MODE=true. If a step file invokes it, the workflow MUST HALT with:

```
HALT — TEAMMATE_MODE protocol violation
  reason: AskUserQuestion was invoked in TEAMMATE_MODE — interactive prompts must be rerouted via SendMessage(lead)
  step: {current step file}
  reference: src/core-skills/bmad-shared/teammate-mode-routing.md §A
```

### B. Defer tracker writes → `tracker_write_request` SendMessage (TAC-17, BAC-8)

Every step that would otherwise call a tracker CRUD operation (issue create, status update, comment, label) MUST instead emit:

```yaml
# SendMessage payload — type: tracker_write_request
type: tracker_write_request
task_id: '{TASK_ID}'
operation: '{create_issue | update_status | comment | label_add | label_remove}'
args:
  {operation-specific args, mirroring the tracker-crud.md protocol input shape}
expected_outcome: '{what the teammate expects to see after the write — used by the lead to verify}'
```

The teammate then waits for an acknowledgment SendMessage:

```yaml
type: tracker_write_ack
operation: '{matching operation}'
status: 'ok' | 'failed'
error: '{if failed, the reason}'
```

If `status == failed`, the teammate HALTs and reports the failure to the lead via a `blocker` payload (see §D below).

### C. Worktree handoff (TAC-19, TAC-20)

If `task_contract.constraints.worktree_path` is non-null, the worktree-lifecycle protocol (`worktree-lifecycle.md`) enters **Branch D — Provided Path Mode**. The teammate uses the given path verbatim, runs the post-creation setup as usual, and does not create a new worktree. **Branch D supersedes Branch A** (no re-evaluation of `worktree_enabled`).

If `worktree_path` is null but TEAMMATE_MODE=true, the workflow falls back to its declared `worktree_purpose` semantics — but the teammate MUST verify that this is intended. A null `worktree_path` in a teammate that expected to write code is suspicious; emit a `blocker` SendMessage and HALT.

### D. Final report (mandatory)

When the workflow completes its last step (success path), it MUST emit a structured SendMessage to the lead with payload:

```yaml
type: phase_complete
task_id: '{TASK_ID}'
parent_phase: '{from task_contract.metadata.parent_phase}'
deliverable:
  format: '{from task_contract.deliverable.format}'
  artifacts:
    - path: '{path to artifact 1}'
      kind: '{spec | diff | report | knowledge_file}'
    # ...
  summary: |
    {2-5 lines summarizing what was produced}
verdict: '{APPROVE | FINDINGS | PASS | FAIL | DONE}'
findings:
  - severity: '{BLOCKER | MAJOR | MINOR | INFO}'
    description: '{finding text}'
  # ... (only if verdict == FINDINGS or FAIL)
```

When the workflow encounters an unrecoverable error (HALT condition), it MUST emit a `blocker` payload instead:

```yaml
type: blocker
task_id: '{TASK_ID}'
parent_phase: '{from task_contract.metadata.parent_phase}'
reason: '{1-3 sentences describing what went wrong}'
context:
  step: '{step file that halted}'
  evidence: |
    {logs, command output, or excerpt that demonstrates the failure}
recovery_options:
  - key: 'R'
    label: 'Retry the phase from scratch'
  - key: 'F'
    label: 'Fix manually then resume'
  - key: 'A'
    label: 'Abandon — close the auto-flow with this issue parked'
```

The four message types — `question`, `tracker_write_request`, `phase_complete`, `blocker` — are the **closed protocol set** between teammates and the orchestrator. Adding new types requires explicit user approval per the story's "Ask First" boundary.

---

## Message Format Validation

All SendMessage payloads emitted by a teammate following this rule MUST be:

1. **Structured YAML** at the top level (parseable with a YAML loader).
2. **Tagged with `type:` field** as the first key.
3. **Tagged with `task_id:`** matching the task contract.
4. **Free of free-form prose at the top level** — context goes inside dedicated keys (`context:`, `evidence:`, `summary:`).

A payload that violates these rules is **REJECTED** by the orchestrator's message handler. The teammate MUST format payloads correctly on the first attempt — there is no retry-on-format-error fallback. If the teammate cannot construct a valid payload, it HALTs with a `blocker`.

---

## Standalone Behavior (TEAMMATE_MODE=false)

When TEAMMATE_MODE=false (the default), this rule is a no-op. The workflow runs exactly as it did before this rule existed. The interactive points use `AskUserQuestion` directly, tracker writes go straight to the tracker, and the workflow returns silently on success.

This guarantees backward compatibility (BAC-9 fallback path, NR-1 through NR-5 non-regression VMs).

---

## Integration into a Workflow's INITIALIZATION

Every workflow whose `workflow.md` declares TEAMMATE_MODE-aware behavior should add this block at the END of INITIALIZATION, after `team-router.md` and after knowledge files have loaded:

```markdown
### N. Detect teammate mode

Apply `~/.claude/skills/bmad-shared/teammate-mode-routing.md` to detect whether this workflow is running inside an Agent Teams teammate context.

This sets:
- `TEAMMATE_MODE` (boolean)
- `ORCH_AUTHORIZED` (boolean — only relevant if TEAMMATE_MODE=true)
- `LEAD_NAME`, `TASK_ID` (only if TEAMMATE_MODE=true)
- `WORKTREE_PATH`, `TRACKER_WRITES_ENABLED` (only if TEAMMATE_MODE=true)

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=false, the workflow MUST refuse to execute top-level workflow.md content (D16 strict applies). Emit a `blocker` SendMessage and exit.

If TEAMMATE_MODE=true and ORCH_AUTHORIZED=true, every subsequent step branches on TEAMMATE_MODE for interactive prompts and tracker writes per §A and §B.
```

---

## Cross-References

- `src/core-skills/bmad-shared/orchestrator-registry.md` — the closed list of authorized orchestrator skills (consumed by this rule's authorization step)
- `src/core-skills/bmad-shared/task-contract-schema.md` — defines the `metadata.{orchestrator_invoked, orchestrator_skill, parent_phase}` block and `constraints.tracker_writes` field consumed by this rule
- `src/core-skills/bmad-shared/worktree-lifecycle.md` — defines Branch D (Provided Path Mode) consumed when `worktree_path` is provided
- `src/core-skills/bmad-shared/spawn-protocol.md` — the orchestrator-side counterpart that builds the spawn prompt with these contract fields
- `_bmad-output/planning-artifacts/spec-agent-teams-integration.md` §8.1 Amendments — the architectural authorization for the D16 override
- `src/bmm-skills/4-implementation/bmad-auto-flow/` — the only currently-registered orchestrator (per `orchestrator-registry.md`)
