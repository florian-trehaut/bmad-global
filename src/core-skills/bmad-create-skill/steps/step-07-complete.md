# Step 7: Complete


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-07-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-07-ENTRY PASSED — entering Step 7: Complete with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present the final skill structure, provide usage guidance, and close the workflow.

## SEQUENCE

### 1. Present the final structure

Show the complete file tree:

```
{TARGET_DIR}/
├── SKILL.md
├── workflow.md
├── steps/
│   ├── step-01-{name}.md
│   ├── step-02-{name}.md
│   └── ...
├── data/                          # if present
│   └── ...
├── templates/                     # if present
│   └── ...
└── subagent-workflows/            # if present
    └── ...
```

With line counts for each file.

### 2. Show invocation examples

"To invoke this skill, use any of these trigger phrases:"

List the trigger phrases from the SKILL.md description, showing both slash-command and natural language:

```
/bmad-{SKILL_NAME}
"{trigger phrase 1}"
"{trigger phrase 2}"
...
```

### 3. Scope-specific guidance

**If global skill:**
"This skill is installed at `~/.claude/skills/bmad-{SKILL_NAME}/` and is already active. It will appear in the skill list for all projects."

**If project skill:**
"This skill is at `{MAIN_PROJECT_ROOT}/.claude/skills/bmad-{SKILL_NAME}/`. To make it available:
1. It is already active for this project
2. Commit the `{MAIN_PROJECT_ROOT}/.claude/skills/bmad-{SKILL_NAME}/` directory to version control for team access"

### 4. Dependency reminders

**If the skill needs workflow-context.md:**
"This skill requires `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` in the project root. If the project is not yet initialized, run `/bmad-project-init` first."

**If the skill needs specific workflow-knowledge files:**
"This skill loads sections from the consolidated knowledge layout:
{list of project.md sections / domain.md / api.md}
Ensure these exist in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` (created by `/bmad-knowledge-bootstrap` after `/bmad-project-init`)."

### 5. Suggest validation

"Run `/bmad-validate-skill` on this skill for a deeper convention audit."

### 6. Summary

```
Skill bmad-{SKILL_NAME} created successfully.

  Files:       {total_count}
  Steps:       {step_count}
  Data files:  {data_count}
  Validation:  ALL PASSED

Location: {TARGET_DIR}
```

---

## END OF WORKFLOW

The bmad-create-skill workflow is complete.

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Complete
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-skill executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06', '07']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06', '07'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
