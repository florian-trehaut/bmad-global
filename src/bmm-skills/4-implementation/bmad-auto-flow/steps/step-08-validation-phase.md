---
nextStepFile: './step-09-finalize.md'
---

# Step 8: Validation Phase — 1 validator teammate (BAC-3, TAC-10)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-08-ENTRY)

```
CHK-STEP-08-ENTRY PASSED — entering Step 8: Validation Phase with ISSUE_ID={id}, MR_URL={url}
```

## STEP GOAL

Spawn exactly 1 validator teammate (BAC-3 / BAC-7 / TAC-10 / TAC-21 / TAC-22) inside an isolated phase team `validation-{RUN_ID}`. The workflow invoked depends on the project type:

- Default (backend / API): `bmad-validation-metier/workflow.md`
- Frontend / full-stack: `bmad-validation-frontend/workflow.md`
- Desktop / native: `bmad-validation-desktop/workflow.md`

The orchestrator detects the type from the spec's frontmatter `type:` field (if explicit) or from the project's tech stack via the protocol `~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`; if ambiguous → ask user.

Before spawning, the lifecycle gate `staging_required` (axe 3 / BAC-3 / TAC-10) is evaluated: if active, the lead invokes `deploy_watch_skill` to wait for staging deploy confirmation BEFORE TaskCreate.

Wait for `phase_complete` with verdict `PASS` / `FAIL`. PASS → tracker → done (BAC-8). FAIL → present `[R]/[F]/[A]` (TAC-25), tracker → in-progress on retry. After phase complete, TeamDelete the phase team.

## MANDATORY SEQUENCE

### 1. Apply pre-spawn validation (TAC-28)

```
assert ISSUE_ID non-null and well-formed → else HALT.
assert WORKTREE_PATH set → else HALT.
assert RUN_ID set, TRACE_FOLDER exists and writable → else HALT.
```

### 2. Lifecycle gate — staging_required (axe 3, BAC-3 / TAC-10)

If `LIFECYCLE_ARTIFACTS.staging_required == true`:

Resolution priority for `deploy_watch_skill` (TAC-12) :
1. Highest : explicit `LIFECYCLE_ARTIFACTS.deploy_watch_skill` (literal skill name in config)
2. Middle : auto-discovered `DEPLOY_WATCH_SKILL_PATH` (from workflow.md INIT §6)
3. Lowest : absent → HALT (cannot validate without staging confirmation per `staging_required: true`)

If a skill is resolved:

```
Invoke the skill via the Skill tool with appropriate args.
Await PASS/FAIL/SKIP from the skill output.
On FAIL: HALT — staging deploy not green ; user fixes deployment then re-runs auto-flow.
On PASS: proceed to step 3.
On SKIP (skill says "no deploy required for this scope"): proceed to step 3.
```

If `LIFECYCLE_ARTIFACTS.staging_required == false` (default), skip this section.

Audit log:

```bash
echo "{\"event\":\"auto-flow.lifecycle.gate.checked\",\"run_id\":\"${RUN_ID}\",\"gate_name\":\"staging_required\",\"outcome\":\"{passed | skipped | failed}\"}" >> "${LOG_FILE}"
```

### 3. Determine validation workflow

```
spec_type = spec frontmatter.type (or null)
project_tech_stack = (resolved via ~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md)

if spec_type in {'frontend', 'full-stack', 'web'}: validation_workflow = 'bmad-validation-frontend/workflow.md'
elif spec_type in {'desktop', 'native', 'cli-with-ui'}: validation_workflow = 'bmad-validation-desktop/workflow.md'
elif project_tech_stack mentions React/Vue/Angular/Astro/Tauri/Electron: validation_workflow = 'bmad-validation-frontend/workflow.md'
elif project_tech_stack mentions Tauri/Electron/Wails: validation_workflow = 'bmad-validation-desktop/workflow.md'
else: validation_workflow = 'bmad-validation-metier/workflow.md'

If still ambiguous: ASK user via AskUserQuestion (this is a direct user-touch point, not batched).
```

### 4. TeamCreate phase-scoped validation team (axe 5)

```
TeamCreate(
  name = "validation-{RUN_ID}",
  teammates = [
    { role: "validator", model: default_worker_model },
  ],
  permission_mode: inherited from lead
)
```

Composition declared in `team-workflows/team-config.md` §validation-team. Single teammate ≤ `max_teammates`.

### 5. Build task contract

```yaml
task_contract:
  team_name: 'validation-{RUN_ID}'
  task_id: 'validator-1'
  role: 'validator'

  workflow_to_invoke: '~/.claude/skills/{validation_workflow}'  # TAC-24

  scope_type: 'validation'
  scope_files: []
  scope_domain: 'Validation Métier (VM) execution per spec'

  input_artifacts:
    - type: 'tracker_issue'
      identifier: '{ISSUE_ID}'
      content: |
        {full SPEC_PATH content}
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
    autonomy_policy: 'strict'                                              # validator routes questions to lead
    trace_path: '{TRACE_FOLDER}/validator-1.md'                            # TAC-13
    halt_conditions:
      - 'Required environment access denied'
      - 'VM cannot be executed in real environment'

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: 'bmad-auto-flow'
    parent_phase: 'validation'
    environment: 'staging'   # or as the user specifies
```

### 6. Branch on TEAM_MODE

#### TEAM_MODE=true: spawn 1 validator

```
TaskCreate with the contract above.
Wait for phase_complete.
```

Audit log per spawn:

```bash
echo "{\"event\":\"auto-flow.teammate.spawned\",\"run_id\":\"${RUN_ID}\",\"teammate_role\":\"validator\",\"task_id\":\"validator-1\",\"trace_path\":\"${TRACE_FOLDER}/validator-1.md\",\"autonomy_policy\":\"strict\"}" >> "${LOG_FILE}"
```

#### TEAM_MODE=false: run validation inline

```
Read FULLY and apply: ~/.claude/skills/{validation_workflow} — load the file with the Read tool, do not summarise from memory, do not skip sections.
Execute inline.
```

### 6b. Apply teammate completion gate (M25 / TAC-19)

After receiving `TaskUpdate(status='completed')` from the validator teammate AND BEFORE processing the verdict or invoking TeamDelete:

**Apply** `~/.claude/skills/bmad-auto-flow/data/teammate-completion-gate.md` §Verification Algorithm. The algorithm verifies the `TaskUpdate(completed)` has a matching `SendMessage(phase_complete, task_id='validator-1')`.

```
on TaskUpdate(task_id='validator-1', status='completed'):
  Apply ~/.claude/skills/bmad-auto-flow/data/teammate-completion-gate.md §Verification Algorithm.
  If gate FAILs (no SendMessage OR invalid fields) → present Remediation menu [N]/[R]/[A]/[I] per gate spec
  If gate PASSes → record verdict and proceed
```

This invocation operationalizes the gate per RevS-1 BLOCKER fix in `standalone-auto-flow-unification.md`.

### 7. Process verdict

Append `phase_complete.trace_files[]` to TRACE_FILES.

Audit log per phase_complete:

```bash
echo "{\"event\":\"auto-flow.teammate.phase_complete\",\"run_id\":\"${RUN_ID}\",\"task_id\":\"validator-1\",\"verdict\":\"{verdict}\",\"findings_count\":{N},\"trace_files\":${trace_files_array}}" >> "${LOG_FILE}"
```

#### Case `verdict == PASS`

- Apply `tracker_write_request` (or directly): transition `ISSUE_ID` → `done` (BAC-8).
- Store `PHASE_RESULTS['validation'] = {verdict: 'PASS', per_vm_results: {...}, trace_files: [...]}`.
- Proceed to step 8 (TeamDelete + transition).

#### Case `verdict == FAIL`

- Present per-VM failures via AskUserQuestion (TAC-25):

```
Validation Métier a échoué sur {N} VMs :
- VM-{n}: {description} → FAIL: {evidence}
- ...

Trace file pour drill-down : {trace_files[0]}

[R] Retry — relancer la validation après fix
[F] Fix manually — je m'occupe du fix manuellement, l'auto-flow termine
[A] Abandon — close auto-flow, story reste à l'état actuel
```

- Wait for user choice:
  - **[R]**: TeamDelete current `validation-{RUN_ID}`, apply `tracker_write_request` to revert `done → in-progress`. Re-loop step-06 (dev) → step-07 (code-review) → step-08 (validation).
  - **[F]**: HALT auto-flow, TeamDelete, proceed to step-09 with abandon-cleanup.
  - **[A]**: emit `tracker_write_request` to mark issue as `blocked`; TeamDelete; proceed to step-09.

### 8. TeamDelete phase team (axe 5)

```
TeamDelete(name = "validation-{RUN_ID}")
```

Mandatory before transition to step-09 — finalize phase has no team of its own.

## SUCCESS / FAILURE

- **SUCCESS**: lifecycle gate `staging_required` evaluated (deploy_watch invoked or skipped per config); TeamCreate `validation-{RUN_ID}` invoked; 1 validator teammate spawned (BAC-3) with trace_path; `phase_complete` received; TRACE_FILES extended; tracker transitioned per verdict; TeamDelete invoked; PHASE_RESULTS['validation'] set
- **FAILURE**: spawning > 1 validator (BAC-3 violation), proceeding silently on FAIL without user input (TAC-25 violation), forgetting `staging_required` gate when configured (BAC-3 violation), forgetting trace_path propagation (TAC-13 violation), forgetting TeamDelete (axe 5 lifecycle violation)

---

## STEP EXIT (CHK-STEP-08-EXIT)

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Validation Phase
  actions_executed: lifecycle gate staging_required={value} {evaluated/skipped}; deploy_watch_skill={path/name or null} {invoked/skipped}; TeamCreate(validation-{RUN_ID}); pre-spawn validation passed; selected validation_workflow={workflow}; {TaskCreate validator with trace_path | inline}; phase_complete verdict={value}; TRACE_FILES extended ({N} entries); tracker {transitioned to done | menu shown — user chose {choice}}; TeamDelete(validation-{RUN_ID})
  artifacts_produced: PHASE_RESULTS['validation'] = {verdict, per_vm_results, deliverable_path, trace_files}
  next_step: ./steps/step-09-finalize.md
```

**Next:** Read FULLY and apply: `./steps/step-09-finalize.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
