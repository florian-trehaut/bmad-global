---
nextStepFile: './step-06-dev-phase.md'
---

# Step 5: Review Phase — 1 spec-reviewer teammate (BAC-3, TAC-7)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Review Phase with TEAM_NAME={name}, ISSUE_ID={id}
```

## STEP GOAL

Spawn exactly 1 spec-reviewer teammate executing `bmad-review-story/workflow.md` in an isolated phase team `review-{RUN_ID}` (BAC-3 / BAC-7 / TAC-7 / TAC-22). Wait for `phase_complete` SendMessage. On verdict APPROVE → transition tracker to `reviewed`. On verdict FINDINGS → present `[R]/[F]/[A]` menu (TAC-13). After phase complete, TeamDelete the phase team.

If TEAM_MODE=false → run `bmad-review-story` inline in the orchestrator's own context (TAC-12 fallback path).

## MANDATORY SEQUENCE

### 1. Apply pre-spawn validation (TAC-28)

```
assert ISSUE_ID non-null and well-formed → else HALT.
assert WORKTREE_PATH set → else HALT.
assert RUN_ID set → else HALT.
assert TRACE_FOLDER exists and writable → else HALT.
```

### 2. TeamCreate phase-scoped review team (axe 5)

```
TeamCreate(
  name = "review-{RUN_ID}",
  teammates = [
    { role: "spec-reviewer", model: default_worker_model },
  ],
  permission_mode: inherited from lead
)
```

Composition declared in `team-workflows/team-config.md` §review-team. Single teammate ≤ `max_teammates`.

### 3. Build task contract

```yaml
task_contract:
  team_name: 'review-{RUN_ID}'
  task_id: 'spec-reviewer-1'
  role: 'spec-reviewer'

  workflow_to_invoke: '~/.claude/skills/bmad-review-story/workflow.md'   # TAC-24

  scope_type: 'review'
  scope_files: []                    # review-story scans the spec, not specific files
  scope_domain: 'Story spec adversarial review'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: '{ISSUE_ID}'        # validated by pre-spawn gate (TAC-28)
      content: |
        {full content of SPEC_PATH read inline — pass the spec body so the teammate doesn't re-query the tracker}
    - type: 'document'
      path: '{SPEC_PATH}'
      format: 'markdown'

  deliverable:
    format: 'yaml_report'
    send_to: '{LEAD_NAME}'

  constraints:
    read_only: true
    worktree_path: '{WORKTREE_PATH}'
    tracker_writes: false
    autonomy_policy: 'strict'                                              # default — review teammate routes questions to lead
    trace_path: '{TRACE_FOLDER}/spec-reviewer-1.md'                        # TAC-13
    halt_conditions:
      - 'Required data source inaccessible'
      - 'Spec missing v2 mandatory sections without explicit waiver'

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: 'bmad-auto-flow'
    parent_phase: 'review'
```

### 4. Branch on TEAM_MODE

#### TEAM_MODE=true: TaskCreate

```
Build the spawn prompt per ~/.claude/skills/bmad-shared/teams/spawn-protocol.md, embedding the task_contract above.
Invoke TaskCreate with the prompt.
```

Audit log per spawn (if `audit_log_enabled`):

```bash
echo "{\"event\":\"auto-flow.teammate.spawned\",\"run_id\":\"${RUN_ID}\",\"teammate_role\":\"spec-reviewer\",\"task_id\":\"spec-reviewer-1\",\"trace_path\":\"${TRACE_FOLDER}/spec-reviewer-1.md\",\"autonomy_policy\":\"strict\"}" >> "${LOG_FILE}"
```

Wait for `phase_complete` SendMessage. While waiting, process inbound messages per `data/question-routing.md` (handle `question`, `tracker_write_request`, `blocker` types from this teammate).

#### TEAM_MODE=false: Inline

```
Read FULLY and apply: ~/.claude/skills/bmad-review-story/workflow.md — load the file with the Read tool, do not summarise from memory, do not skip sections.

Execute inline. The workflow's TEAMMATE_MODE detection finds task_contract is null → standalone mode. Use the orchestrator's local state directly (ISSUE_ID, WORKTREE_PATH, etc.) instead of task_contract fields.
```

### 5. Process verdict

After `phase_complete` is received (or inline workflow returns):

Append `phase_complete.trace_files[]` to the global `TRACE_FILES` for step-09 final report. The trace_path written by the teammate is the durable audit anchor — the lead reads it ONLY if drill-down beyond `summary:` is needed (TAC-17).

Audit log per phase_complete (if `audit_log_enabled`):

```bash
echo "{\"event\":\"auto-flow.teammate.phase_complete\",\"run_id\":\"${RUN_ID}\",\"task_id\":\"spec-reviewer-1\",\"verdict\":\"{verdict}\",\"findings_count\":{N},\"trace_files\":${trace_files_array},\"autonomy_decisions_count\":{N}}" >> "${LOG_FILE}"
```

#### Case `verdict == APPROVE`

- Apply `tracker_write_request` (or directly in TEAM_MODE=false): transition `ISSUE_ID` → `reviewed` status.
- Store `PHASE_RESULTS['review'] = {verdict: 'APPROVE', findings: [], trace_files: [...]}`.
- Proceed to step 6 (TeamDelete + transition).

#### Case `verdict == FINDINGS`

- Present findings to the user via AskUserQuestion (TAC-13):

```
Le spec-reviewer a trouvé {N} findings ({n_blocker} BLOCKER, {n_major} MAJOR, ...).

{list findings with file:line and proposed action}

Trace file pour drill-down : {trace_files[0]}

Que veux-tu faire ?
[R] Retry — re-spawner le spec-reviewer après correction du spec
[F] Fix manually — je m'occupe du fix manuellement, l'auto-flow termine ici
[A] Abandon — close auto-flow, story reste en l'état
```

- Wait for user choice:
  - **[R]**: TeamDelete current `review-{RUN_ID}`, gather user's intended corrections, re-loop step-05 (TeamCreate again)
  - **[F]**: HALT auto-flow, leave story at current tracker state, TeamDelete, proceed to step-09 for cleanup
  - **[A]**: emit `tracker_write_request` to mark issue as `blocked` (or equivalent), TeamDelete, proceed to step-09

### 6. TeamDelete phase team (axe 5)

```
TeamDelete(name = "review-{RUN_ID}")
```

Mandatory before transition to step-06 — the next phase will TeamCreate `dev-{RUN_ID}` (different scope).

## SUCCESS / FAILURE

- **SUCCESS**: TeamCreate `review-{RUN_ID}` invoked, 1 teammate spawned with trace_path propagated (or inline in fallback), `phase_complete` received with trace_files, TRACE_FILES extended, tracker transitioned per verdict, TeamDelete invoked before transition, PHASE_RESULTS['review'] set
- **FAILURE**: spawning > 1 review teammate (BAC-3 violation), bypassing pre-spawn validation (TAC-28), silently advancing on FINDINGS without user input (TAC-13 violation), forgetting TeamDelete before step-06 (axe 5 lifecycle violation), forgetting to propagate trace_path in spawn contract (TAC-13 violation)

---

## STEP EXIT (CHK-STEP-05-EXIT)

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Review Phase
  actions_executed: TeamCreate(review-{RUN_ID}); pre-spawn validation passed; {TaskCreate spec-reviewer with trace_path | inline bmad-review-story}; phase_complete verdict={value}; TRACE_FILES extended ({N} entries); TeamDelete(review-{RUN_ID}); tracker {transitioned | menu shown — user chose {R/F/A}}
  artifacts_produced: PHASE_RESULTS['review'] = {verdict, findings, trace_files, deliverable_path}
  next_step: ./steps/step-06-dev-phase.md (if proceed) | ./steps/step-09-finalize.md (if abandon)
```

**Next:** Read FULLY and apply: `./steps/step-06-dev-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
