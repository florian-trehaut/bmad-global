# Step 1: Discover Requirements


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Discover Requirements with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Understand what the user wants the new skill to do through open-ended conversation. Capture the purpose, triggers, interaction model, and dependencies.

## RULES

- Ask open-ended questions — do not assume
- Detect the user's language and match it
- Do NOT start designing yet — this step is purely about understanding
- Summarize understanding at the end and get explicit confirmation

## SEQUENCE

### 1. Ask about purpose

"What should this skill do? Describe the workflow it automates — from trigger to completion."

Probe for:
- **What problem does it solve?** (manual process, repetitive task, quality gate, etc.)
- **Who uses it?** (developer, reviewer, PM, automated)
- **What is the input?** (issue ID, branch name, file path, freeform text, nothing)
- **What is the output?** (files created, status updated, report generated, code changes)
- **What are the main steps?** (rough sequence, even if not detailed yet)

### 2. Ask about interaction model

"How interactive should this be?"

Options:
- **Fully automated** — runs start to finish, HALTs only on errors
- **Interactive** — checkpoints at key decisions, user confirms before proceeding
- **Mixed** — some steps auto, some require input (most common)

### 3. Ask about dependencies

"Does this skill need access to any of these?"

| Dependency | Question |
|------------|----------|
| Project context | Does it need `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`? (i.e., does it use tracker, forge, build commands, etc.) |
| Project knowledge | Does it need `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` files? (stack info, environment config, etc.) |
| External tools | Does it call CLI tools, MCP servers, APIs? |
| Subagents | Are there steps that benefit from parallel execution via subagents? |
| Shared rules | Does `no-fallback-no-false-data.md` apply? (usually yes if the skill touches code or data) |

### 4. Ask about trigger phrases

"What phrases should invoke this skill? List variations — English and other languages if relevant."

Examples from existing skills:
- bmad-dev-story: 'dev story', 'implement story', 'start development', 'lance le dev'
- bmad-validation-metier: 'validation metier', 'validate ticket', 'tester en staging', 'VM'
- bmad-project-init: 'bmad init', 'initialize project', 'setup bmad', 'configure project'
- bmad-knowledge-bootstrap: 'knowledge bootstrap', 'bootstrap knowledge', 'generate knowledge', 'workflow knowledge'

### 5. Compile design brief

Assemble the answers into a mental design brief:

```
## Design Brief

**Purpose:** {one paragraph}
**Trigger phrases:** {list}
**Input:** {what the skill receives}
**Output:** {what the skill produces}
**Interaction model:** {automated / interactive / mixed}
**Dependencies:**
  - {MAIN_PROJECT_ROOT}/.claude/workflow-context.md: {yes/no}
  - {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/: {list of files or "none"}
  - External tools: {list or "none"}
  - Subagents: {yes/no — if yes, for what}
  - Shared rules: {yes/no}
**Rough step sequence:** {numbered list}
```

### 6. CHECKPOINT

Present the design brief to the user:

"Here is my understanding of the skill you want to build:"

{display the design brief}

"Is this accurate? Any corrections or additions?"

WAIT for user confirmation. Apply any corrections before proceeding.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Discover Requirements
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-02-classify.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
