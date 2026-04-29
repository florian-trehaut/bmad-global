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

Spawn exactly 1 validator teammate (BAC-3 / TAC-10). The workflow invoked depends on the project type:

- Default (backend / API): `bmad-validation-metier/workflow.md`
- Frontend / full-stack: `bmad-validation-frontend/workflow.md`
- Desktop / native: `bmad-validation-desktop/workflow.md`

The orchestrator detects the type from the spec's frontmatter `type:` field (if explicit) or from the project's tech stack via the protocol `~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`; if ambiguous → ask user.

Wait for `phase_complete` with verdict `PASS` / `FAIL`. PASS → tracker → done (BAC-8). FAIL → present `[R]/[F]/[A]` (TAC-25), tracker → in-progress on retry.

## MANDATORY SEQUENCE

### 1. Apply pre-spawn validation (TAC-28)

```
assert ISSUE_ID non-null and well-formed → else HALT.
assert WORKTREE_PATH set → else HALT.
```

### 2. Determine validation workflow

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

### 3. Build task contract

```yaml
task_contract:
  team_name: '{TEAM_NAME}'
  task_id: 'validation-validator-1'
  role: 'validator'

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
    halt_conditions:
      - 'Required environment access denied'
      - 'VM cannot be executed in real environment'

  metadata:
    orchestrator_invoked: true
    orchestrator_skill: 'bmad-auto-flow'
    parent_phase: 'validation'
    environment: 'staging'   # or as the user specifies

  workflow_to_invoke: '{validation_workflow}'
```

### 4. Branch on TEAM_MODE

#### TEAM_MODE=true: spawn 1 validator

```
TaskCreate with the contract above.
Wait for phase_complete.
```

#### TEAM_MODE=false: run validation inline

```
Read FULLY and apply: ~/.claude/skills/{validation_workflow} — load the file with the Read tool, do not summarise from memory, do not skip sections.
Execute inline.
```

### 5. Process verdict

#### Case `verdict == PASS`

- Apply `tracker_write_request` (or directly): transition `ISSUE_ID` → `done` (BAC-8).
- Store `PHASE_RESULTS['validation'] = {verdict: 'PASS', per_vm_results: {...}}`.
- Proceed to step-09.

#### Case `verdict == FAIL`

- Present per-VM failures via AskUserQuestion (TAC-25):

```
Validation Métier a échoué sur {N} VMs :
- VM-{n}: {description} → FAIL: {evidence}
- ...

[R] Retry — relancer la validation après fix
[F] Fix manually — je m'occupe du fix manuellement, l'auto-flow termine
[A] Abandon — close auto-flow, story reste à l'état actuel
```

- Wait for user choice:
  - **[R]**: Apply `tracker_write_request` to revert `done → in-progress`. Re-loop step-06 (dev) → step-07 (code-review) → step-08 (validation).
  - **[F]**: HALT auto-flow, proceed to step-09 with abandon-cleanup.
  - **[A]**: emit `tracker_write_request` to mark issue as `blocked`; proceed to step-09.

### 6. Audit log

```bash
echo "[step-08-validation-phase] validation_workflow={workflow}, verdict={verdict}, user_choice={choice if FAIL}" >> $LOG_FILE
```

## SUCCESS / FAILURE

- **SUCCESS**: 1 validator teammate spawned (BAC-3), `phase_complete` received, tracker transitioned per verdict, PHASE_RESULTS['validation'] set
- **FAILURE**: spawning > 1 validator (BAC-3 violation), proceeding silently on FAIL without user input (TAC-25 violation)

---

## STEP EXIT (CHK-STEP-08-EXIT)

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Validation Phase
  actions_executed: pre-spawn validation passed; selected validation_workflow={workflow}; {TaskCreate validator | inline}; phase_complete verdict={value}; tracker {transitioned to done | menu shown — user chose {choice}}
  artifacts_produced: PHASE_RESULTS['validation'] = {verdict, per_vm_results, deliverable_path}
  next_step: ./steps/step-09-finalize.md
```

**Next:** Read FULLY and apply: `./steps/step-09-finalize.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
