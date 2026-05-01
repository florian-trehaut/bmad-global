---
nextStepFile: './step-07-code-review-phase.md'
---

# Step 6: Dev Phase — N dev teammates (BAC-11, BAC-13, TAC-8)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: Dev Phase with dev_team_size={N}, SPEC_PROFILE={profile}
```

## STEP GOAL

Spawn N dev teammates (`agent_teams.dev_team_size`, default 1, clamped to `[1, max_teammates]` per TAC-26c) inside an isolated phase team `dev-{RUN_ID}`. The workflow each teammate invokes depends on `SPEC_PROFILE` (BAC-13):

- `SPEC_PROFILE == 'quick'` → `bmad-quick-dev/workflow.md`
- `SPEC_PROFILE == 'full'` → `bmad-dev-story/workflow.md`

Spawn contracts set `autonomy_policy: spec-driven` (BAC-2 / TAC-4 / TAC-5 / TAC-5b / TAC-6 / TAC-6b) — dev teammate auto-acknowledges spec-verbatim decisions, auto-resolves TACTICAL items from spec patterns, HALTs on STRUCTURAL divergence/absence. Each spawn contract sets `trace_path` for durable audit (TAC-13 / TAC-14).

Wait for `phase_complete` from each. On all DONE → transition tracker to `review`. On any blocker / fail → present `[R]/[F]/[A]` (TAC-25). After phase complete, TeamDelete the phase team.

## MANDATORY SEQUENCE

### 1. Apply pre-spawn validation (TAC-28)

```
assert ISSUE_ID non-null and well-formed → else HALT.
assert WORKTREE_PATH set → else HALT.
assert RUN_ID set, TRACE_FOLDER exists and writable → else HALT.
```

### 2. Compute N

```
dev_team_size = agent_teams.dev_team_size from workflow-context.md (default 1)
N = clamp(dev_team_size, 1, MAX_TEAMMATES)
```

If N > 1, the orchestrator will need to coordinate merging/distributing dev work — this is an advanced path. For v1.0, default behavior is N=1; multi-dev coordination is OOS for v1.0 per the team-config.md "Consensus rules" section.

### 3. Determine workflow per BAC-13

```
if SPEC_PROFILE == 'quick': dev_workflow = '~/.claude/skills/bmad-quick-dev/workflow.md'
elif SPEC_PROFILE == 'full': dev_workflow = '~/.claude/skills/bmad-dev-story/workflow.md'
else: HALT (SPEC_PROFILE invalid)
```

### 4. TeamCreate phase-scoped dev team (axe 5)

```
TeamCreate(
  name = "dev-{RUN_ID}",
  teammates = [
    { role: "dev", model: default_worker_model } x N,
  ],
  permission_mode: inherited from lead
)
```

Composition declared in `team-workflows/team-config.md` §dev-team. N teammates ≤ `max_teammates`.

### 5. Branch on TEAM_MODE

#### TEAM_MODE=true: spawn N dev teammates

For each teammate `i` in `1..N`:

```yaml
task_contract:
  team_name: 'dev-{RUN_ID}'
  task_id: 'dev-{i}'
  role: 'dev'

  workflow_to_invoke: '{dev_workflow}'                                     # TAC-24 — explicit per BAC-13

  scope_type: 'generation'
  scope_files: []                    # dev-story / quick-dev determines its own scope from the spec
  scope_domain: 'Implement story per spec'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: '{ISSUE_ID}'
      content: |
        {full content of SPEC_PATH}
    - type: 'document'
      path: '{SPEC_PATH}'
      format: 'markdown'

  deliverable:
    format: 'yaml_report'
    send_to: '{LEAD_NAME}'

  constraints:
    read_only: false                                                        # dev writes code
    worktree_path: '{WORKTREE_PATH}'
    tracker_writes: false
    autonomy_policy: 'spec-driven'                                          # TAC-4 — dev teammate auto-resolves spec-verbatim + TACTICAL ; HALTs on STRUCTURAL
    trace_path: '{TRACE_FOLDER}/dev-{i}.md'                                 # TAC-13 / TAC-14
    halt_conditions:
      - '3 consecutive test failures on the same task'
      - 'Quality gate failure that cannot be resolved by the teammate'
      - 'STRUCTURAL ambiguity not anticipated in spec (per autonomy_policy=spec-driven)'

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: 'bmad-auto-flow'
    parent_phase: 'dev'
```

**Citation rationale** (autonomy_policy=spec-driven set explicitly per user 2026-04-30) : the dev phase is the heaviest user-touchpoint hotspot in the pre-impl flow ; spec-driven policy lets the dev teammate execute autonomously while preserving STRUCTURAL escalation for arch deviations. Semantics defined in `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md §Autonomy policy enforcement`.

Audit log per spawn:

```bash
echo "{\"event\":\"auto-flow.teammate.spawned\",\"run_id\":\"${RUN_ID}\",\"teammate_role\":\"dev\",\"task_id\":\"dev-${i}\",\"trace_path\":\"${TRACE_FOLDER}/dev-${i}.md\",\"autonomy_policy\":\"spec-driven\"}" >> "${LOG_FILE}"
```

Invoke TaskCreate for each i.

#### TEAM_MODE=false: inline

If N > 1 in TEAM_MODE=false, ASK the user how to handle (multi-dev parallelism is impossible inline). Default to N=1 with a warning.

```
Read FULLY and apply: ~/.claude/skills/bmad-{quick-dev | dev-story}/workflow.md — load the file with the Read tool, do not summarise from memory, do not skip sections.
Execute inline.
```

### 6. Wait for all phase_complete reports

Process inbound messages per `data/question-routing.md`. Special handling for dev:
- `tracker_write_request` for `update_status` → orchestrator updates tracker → `in-progress` (handled inline; the teammate would have done it standalone)
- `tracker_write_request` for `create_mr` → orchestrator runs `gh pr create` (or equivalent forge CLI) and replies with MR_IID, MR_URL
- `question` with `critical_ambiguity: true` → autonomy_policy=spec-driven escalation. Surface to user via AskUserQuestion (TAC-6 / TAC-6b). Reply via SendMessage(question_reply).
- `phase_complete` with `verdict: 'DONE'` → store result, append `trace_files[]` to TRACE_FILES, append `autonomy_decisions[]` to PHASE_RESULTS['dev'].autonomy_decisions, await all N teammates' reports

#### 6b. Apply teammate completion gate per teammate (M25 / TAC-19)

After receiving `TaskUpdate(status='completed')` from each dev teammate AND BEFORE transitioning the tracker or invoking TeamDelete:

**Apply** `~/.claude/skills/bmad-auto-flow/data/teammate-completion-gate.md` §Verification Algorithm. The algorithm verifies each `TaskUpdate(completed)` has a matching `SendMessage(phase_complete, task_id=N)`.

```
for each i in [1..dev_team_size]:
  on TaskUpdate(task_id='dev-{i}', status='completed'):
    Apply ~/.claude/skills/bmad-auto-flow/data/teammate-completion-gate.md §Verification Algorithm.
    If gate FAILs (no SendMessage OR invalid fields) → present Remediation menu [N]/[R]/[A]/[I] per gate spec
    If gate PASSes → record verdict and proceed
```

This invocation operationalizes the gate that was previously documented but unwired (per RevS-1 BLOCKER fix). The pattern was empirically validated during Phase 4 of `standalone-bmad-shared-restructure.md`.

When all N teammates report `DONE`:
- Apply tracker transition `in-progress → review` per BAC-8.
- Store `PHASE_RESULTS['dev'] = {verdict: 'DONE', commit_id, mr_url, test_results, trace_files, autonomy_decisions}` (aggregating across N teammates if > 1).

If any teammate reports `blocker` or `verdict != DONE`:
- Present `[R]/[F]/[A]` menu per TAC-25.

Audit log per phase_complete:

```bash
echo "{\"event\":\"auto-flow.teammate.phase_complete\",\"run_id\":\"${RUN_ID}\",\"task_id\":\"dev-${i}\",\"verdict\":\"{verdict}\",\"findings_count\":{N},\"trace_files\":${trace_files_array},\"autonomy_decisions_count\":{N}}" >> "${LOG_FILE}"
```

### 7. TeamDelete phase team (axe 5)

```
TeamDelete(name = "dev-{RUN_ID}")
```

Mandatory before transition to step-07 — the next phase team is `codereview-{RUN_ID}` (different scope, 5 teammates).

## SUCCESS / FAILURE

- **SUCCESS**: TeamCreate `dev-{RUN_ID}` invoked, N teammates spawned with autonomy_policy=spec-driven + trace_path (or inline), all DONE, TRACE_FILES extended, autonomy_decisions captured, tracker transitioned to review, MR created, TeamDelete invoked, PHASE_RESULTS['dev'] set
- **FAILURE**: wrong workflow invoked (BAC-13 violation), spawning > MAX_TEAMMATES (TAC-26c clamping violation), advancing without all teammates DONE, omitting autonomy_policy=spec-driven (BAC-2 violation), forgetting TeamDelete before step-07 (axe 5 lifecycle violation), forgetting trace_path propagation (TAC-13 violation)

---

## STEP EXIT (CHK-STEP-06-EXIT)

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Dev Phase
  actions_executed: TeamCreate(dev-{RUN_ID}, N={N} teammates); pre-spawn validation passed; spawned N={N} dev teammates with workflow={dev_workflow}, autonomy_policy=spec-driven, trace_path; collected {N} phase_complete; TRACE_FILES extended ({N} entries); autonomy_decisions captured; tracker → review; MR_URL captured; TeamDelete(dev-{RUN_ID})
  artifacts_produced: PHASE_RESULTS['dev'] = {verdict, commit_id, MR_URL, test_results, trace_files, autonomy_decisions}, MR_IID, MR_URL
  next_step: ./steps/step-07-code-review-phase.md
```

**Next:** Read FULLY and apply: `./steps/step-07-code-review-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
