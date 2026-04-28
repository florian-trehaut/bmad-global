# Step 1: Select Skill to Validate


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Select Skill to Validate with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Identify which bmad-* skill the user wants to validate. Load its entire structure for inspection.

## RULES

- Scan BOTH global (`~/.claude/skills/bmad-*/`) and project (`{MAIN_PROJECT_ROOT}/.claude/skills/bmad-*/`) locations
- NEVER modify any file — this is a read-only audit
- If the user provides a path directly, skip the listing
- HALT if the target is not a bmad-* skill (no SKILL.md found)

## SEQUENCE

### 1. List all bmad-* skills

Scan both locations:

**Global:** `~/.claude/skills/bmad-*/`
**Project:** `{MAIN_PROJECT_ROOT}/.claude/skills/bmad-*/` (from the git repository root)

For each skill found, read `SKILL.md` and extract:
- `name` from frontmatter
- `description` from frontmatter
- Location (global / project)

### 2. Present the skill list

```
## Available bmad-* skills

| #   | Name                    | Location | Description                     |
| --- | ----------------------- | -------- | ------------------------------- |
| 1   | bmad-dev-story          | global   | Automated story implementation  |
| 2   | bmad-validation-metier  | global   | Production validation gate      |
| ... | ...                     | ...      | ...                             |

Which skill do you want to validate? (or provide a path)
```

**If the user already specified a skill name or path** — skip the list.

WAIT for user selection.

### 3. Load the entire skill

Store `TARGET_SKILL = {name, location, base_path}`.

Read ALL files in the skill:
- `SKILL.md`
- `workflow.md`
- All files in `steps/` (or root-level step files)
- All files in `data/` (if exists)
- All files in `subagent-workflows/` (if exists)
- All files in `templates/` (if exists)

Record file inventory with line counts.

### 4. Confirm and proceed

"Validating **{TARGET_SKILL.name}** at `{base_path}`. Starting checks..."

Load and execute `./steps/step-02-structure.md`.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Select Skill to Validate
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
