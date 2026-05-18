---
nextStepFile: './step-02-discovery.md'
---

# Step 1: Detect Intent and Bind Workspace

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu (CHK-INIT PASSED emis dans workflow.md INIT)

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Detect Intent and Bind Workspace with {project_name=…, planning_artifacts=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Detect the user's intent (Create / Update / Validate), bind the GDD workspace, surface existing inputs, and signal the right-skill check before drafting begins.

## RULES

- Communicate in `{COMMUNICATION_LANGUAGE}`; write the GDD in `{document_output_language}`.
- You are a facilitator — never decide intent for the user; ask if unclear.
- Persistence is near real-time — create the workspace skeleton on disk the moment Create intent is confirmed; tell the user the path.
- For Update and Validate, the workspace is the existing folder of the GDD being targeted.

## SEQUENCE

### 1. Greet and detect mode

Greet `{user_name}`, speaking in `{COMMUNICATION_LANGUAGE}`. Mention the user can invoke the skills `bmad-party-mode` for multi-agent perspectives or `bmad-advanced-elicitation` for deeper exploration at any point.

Detect mode:
- **Headless** (no interactive user / CI / agent-spawned): read `references/headless.md` and follow it for the whole run with matched intent.
- **Interactive**: continue to step 2.

### 2. Detect intent

Ask the user (or infer from the trigger phrase):

| Intent | Trigger | Workspace |
|---|---|---|
| **Create** | new GDD | fresh folder at `{planning_artifacts}/gdd/` |
| **Update** | reconcile existing GDD with a change | the existing GDD folder |
| **Validate** | critique existing GDD | the existing GDD folder |

If unclear, ask:

> "Do you want to **create** a new GDD, **update** an existing one, or **validate** an existing GDD against the checklist?"

Bind `{INTENT}` to the selected option.

### 3. Check for existing GDD

Look for `*gdd*.md` and `*game-design*.md` in `{planning_artifacts}/**` and `{MAIN_PROJECT_ROOT}/docs/**`.

**If found:**
- If intent is Create: ask if the user wants to **resume** an existing draft or **start fresh** (which will overwrite). Default to resume unless user picks fresh.
- If intent is Update or Validate: confirm this is the GDD being targeted.

**If not found:**
- If intent is Create: continue with fresh workspace.
- If intent is Update or Validate: HALT — "No GDD found at `{planning_artifacts}/gdd/**` or `{MAIN_PROJECT_ROOT}/docs/**`. Please provide the GDD path or switch to Create intent."

### 4. Bind workspace

For Create intent, bind `{DOC_WORKSPACE}` to `{planning_artifacts}/gdd/` (create the folder). Initialize:
- `gdd.md` with YAML frontmatter (`title`, `game_type`, `platforms`, `created`, `updated`, `stepsCompleted: [1]`)
- `decision-log.md` with a header and a "## Initialization" entry capturing intent, date, user_name

Tell the user the path: "GDD workspace bound to `{DOC_WORKSPACE}`. Skeleton created."

For Update/Validate, bind `{DOC_WORKSPACE}` to the existing GDD folder.

### 5. Right-skill check (gentle)

Once intent is detected, surface alternatives one sentence each, let the user choose:

- **Formal requirements / external-tool format** → suggest `bmad-create-prd` (PRD owns functional/non-functional requirements with acceptance criteria; the GDD owns mechanics, levels, art, audio, progression).
- **Express implementation** (wants to build now, no captured artifact needed) → suggest `bmad-quick-dev`.

If the user prefers this skill anyway, proceed.

### 6. Surface existing inputs

Surface inputs we can use to pre-populate the GDD (do NOT load them into the parent context — extract via subagent later):

Search `{planning_artifacts}/**`, `{MAIN_PROJECT_ROOT}/docs/**`, `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/**` for:
- Game brief (`*brief*.md`, `*game-brief*.md`)
- Brainstorming docs (`*brainstorm*.md`)
- Research / market research / domain research (`*research*.md`, `*market*.md`, `*domain*.md`)
- Prior GDD (if Update or Validate)

Confirm with user: "I found these inputs — should we feed them into Discovery? Anything else you want to add?"

Track confirmed inputs in `gdd.md` frontmatter as `inputDocuments: [path1, path2, ...]`.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Detect Intent and Bind Workspace
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-02-discovery.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-02-discovery.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
