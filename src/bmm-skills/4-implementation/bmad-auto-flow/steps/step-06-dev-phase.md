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

Spawn N dev teammates (`agent_teams.dev_team_size`, default 1, clamped to `[1, max_teammates]` per TAC-26). The workflow each teammate invokes depends on `SPEC_PROFILE` (BAC-13):

- `SPEC_PROFILE == 'quick'` → `bmad-quick-dev/workflow.md`
- `SPEC_PROFILE == 'full'` → `bmad-dev-story/workflow.md`

Wait for `phase_complete` from each. On all DONE → transition tracker to `review`. On any blocker / fail → present `[R]/[F]/[A]` (TAC-25).

## MANDATORY SEQUENCE

### 1. Apply pre-spawn validation (TAC-28)

```
assert ISSUE_ID non-null and well-formed → else HALT.
assert WORKTREE_PATH set → else HALT.
```

### 2. Compute N

```
dev_team_size = agent_teams.dev_team_size from workflow-context.md (default 1)
N = clamp(dev_team_size, 1, MAX_TEAMMATES)
```

If N > 1, the orchestrator will need to coordinate merging/distributing dev work — this is an advanced path. For v1.0, default behavior is N=1; multi-dev coordination is OOS for v1.0 per the team-config.md "Consensus rules" section.

### 3. Determine workflow per BAC-13

```
if SPEC_PROFILE == 'quick': dev_workflow = 'bmad-quick-dev/workflow.md'
elif SPEC_PROFILE == 'full': dev_workflow = 'bmad-dev-story/workflow.md'
else: HALT (SPEC_PROFILE invalid)
```

### 4. Branch on TEAM_MODE

#### TEAM_MODE=true: spawn N dev teammates

For each teammate `i` in `1..N`:

```yaml
task_contract:
  team_name: '{TEAM_NAME}'
  task_id: 'dev-{i}'
  role: 'dev'

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
    read_only: false                 # dev writes code
    worktree_path: '{WORKTREE_PATH}'
    tracker_writes: false
    halt_conditions:
      - '3 consecutive test failures on the same task'
      - 'Quality gate failure that cannot be resolved by the teammate'

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: 'bmad-auto-flow'
    parent_phase: 'dev'

  # Pass-through: which dev workflow to invoke
  workflow_to_invoke: '{dev_workflow}'
```

The teammate's INITIALIZATION reads `workflow_to_invoke` from a custom field in `metadata` and loads the corresponding workflow.md. (Alternative: use the `role` mapping in team-config.md — but workflow_to_invoke makes the choice explicit per BAC-13.)

Invoke TaskCreate for each i.

#### TEAM_MODE=false: inline

If N > 1 in TEAM_MODE=false, ASK the user how to handle (multi-dev parallelism is impossible inline). Default to N=1 with a warning.

```
Read FULLY and apply: ~/.claude/skills/bmad-{quick-dev | dev-story}/workflow.md — load the file with the Read tool, do not summarise from memory, do not skip sections.
Execute inline.
```

### 5. Wait for all phase_complete reports

Process inbound messages per `data/question-routing.md`. Special handling for dev:
- `tracker_write_request` for `update_status` → orchestrator updates tracker → `in-progress` (handled inline; the teammate would have done it standalone)
- `tracker_write_request` for `create_mr` → orchestrator runs `gh pr create` (or equivalent forge CLI) and replies with MR_IID, MR_URL
- `phase_complete` with `verdict: 'DONE'` → store result, await all N teammates' reports

When all N teammates report `DONE`:
- Apply tracker transition `in-progress → review` per BAC-8.
- Store `PHASE_RESULTS['dev'] = {verdict: 'DONE', commit_id, mr_url, test_results}` (aggregating across N teammates if > 1).

If any teammate reports `blocker` or `verdict != DONE`:
- Present `[R]/[F]/[A]` menu per TAC-25.

### 6. Audit log

```bash
echo "[step-06-dev-phase] dev_team_size={N}, dev_workflow={workflow}, verdict={verdict}, MR_URL={url}" >> $LOG_FILE
```

## SUCCESS / FAILURE

- **SUCCESS**: N teammates spawned (or inline), all DONE, tracker transitioned to review, MR created, PHASE_RESULTS['dev'] set
- **FAILURE**: wrong workflow invoked (BAC-13 violation), spawning > MAX_TEAMMATES (TAC-26 violation), advancing without all teammates DONE

---

## STEP EXIT (CHK-STEP-06-EXIT)

```
CHK-STEP-06-EXIT PASSED — completed Step 6: Dev Phase
  actions_executed: pre-spawn validation passed; spawned N={N} dev teammates with workflow={dev_workflow}; collected {N} phase_complete; tracker → review; MR_URL captured
  artifacts_produced: PHASE_RESULTS['dev'] = {verdict, commit_id, MR_URL, test_results}, MR_IID, MR_URL
  next_step: ./steps/step-07-code-review-phase.md
```

**Next:** Read FULLY and apply: `./steps/step-07-code-review-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
