# Step 1: Mode Detection

**Goal:** Determine execution mode, capture baseline, handle escalation if needed.

---


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Mode Detection with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teams/teammate-mode-routing.md`, when TEAMMATE_MODE=true and ORCH_AUTHORIZED=true:

- Skip user prompt for execution mode. Read mode + tech-spec path (or direct task description) from `task_contract`:
  - If `task_contract.input_artifacts[type=document]` is present → mode=`tech-spec`, `tech_spec_path` = `document.path`
  - Else → mode=`direct`, tasks read from `task_contract.scope_domain` or `task_contract.input_artifacts[type=custom].data.tasks`
- HALT TAC-28 if neither artifact form is present.
- Skip the escalation menu (the orchestrator already chose `quick-dev` vs `dev-story` per BAC-13 of story `auto-flow-orchestrator`).

When TEAMMATE_MODE=false, proceed with the State Variables section below as normal.

## STATE VARIABLES (capture now, persist throughout)

These variables MUST be set in this step and available to all subsequent steps:

- `{baseline_commit}` - Git HEAD at workflow start (or "NO_GIT" if not a git repo)
- `{execution_mode}` - "tech-spec" or "direct"
- `{tech_spec_path}` - Path to tech-spec file (if Mode A)

---

## EXECUTION SEQUENCE

### 1. Capture Baseline

**If Git repo exists** (`.git` directory present):
- Run `git rev-parse HEAD` and store result as `{baseline_commit}`

**If NOT a Git repo:**
- Set `{baseline_commit}` = "NO_GIT"

### 2. Load Project Context

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (if exists) and `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (if exists) from the project root as foundational references for ALL implementation decisions.

### 3. Parse User Input

Analyze the user's input to determine mode:

**Mode A: Tech-Spec**
- User provided a path to a tech-spec file
- Load the spec, extract tasks/context/AC
- Set `{execution_mode}` = "tech-spec"
- Set `{tech_spec_path}` = provided path
- **NEXT:** Read fully and follow: `step-02b-evidence.md` (lightweight Phase B pass before implementation)

**Mode B: Direct Instructions**
- User provided task description directly
- Set `{execution_mode}` = "direct"
- **NEXT:** Evaluate escalation threshold, then proceed

---

## ESCALATION THRESHOLD (Mode B only)

Evaluate user input with minimal token usage (no file loading):

**Triggers escalation (if 2+ signals present):**
- Multiple components mentioned (dashboard + api + database)
- System-level language (platform, integration, architecture)
- Uncertainty about approach ("how should I", "best way to")
- Multi-layer scope (UI + backend + data together)
- Extended timeframe ("this week", "over the next few days")

**Reduces signal:**
- Simplicity markers ("just", "quickly", "fix", "bug", "typo", "simple")
- Single file/component focus
- Confident, specific request

Use holistic judgment, not mechanical keyword matching.

---

## ESCALATION HANDLING

### No Escalation (simple request)

Display: "**Select:** [P] Plan first (tech-spec) [E] Execute directly"

- IF P: Direct user to `/bmad-create-story`. **EXIT Quick Dev.**
- IF E: Ask for any additional guidance, then **NEXT:** Read fully and follow: `step-02-context-gathering.md`

ALWAYS halt and wait for user input after presenting menu.

### Escalation Triggered - Level 0-2

Present: "This looks like a focused feature with multiple components."

**[P] Plan first (tech-spec)** (recommended)
**[W] Seems bigger than quick-dev** - Recommend the full PRD process
**[E] Execute directly**

- IF P: Direct to `/bmad-create-story`. **EXIT Quick Dev.**
- IF W: Direct user to `/bmad-create-prd`. **EXIT Quick Dev.**
- IF E: Ask for guidance, then **NEXT:** Read fully and follow: `step-02-context-gathering.md`

### Escalation Triggered - Level 3+

Present: "This sounds like platform/system work."

**[W] Start full planning** (recommended)
**[P] Plan first (tech-spec)** (lighter planning)
**[E] Execute directly** - feeling lucky

- IF P: Direct to `/bmad-create-story`. **EXIT Quick Dev.**
- IF W: Direct user to `/bmad-create-prd`. **EXIT Quick Dev.**
- IF E: Ask for guidance, then **NEXT:** Read fully and follow: `step-02-context-gathering.md`

---

## NEXT STEP DIRECTIVE

**CRITICAL:** When this step completes, explicitly state which step to load:

- Mode A (tech-spec): "**NEXT:** Read fully and follow: `step-02b-evidence.md`"
- Mode B (direct, [E] selected): "**NEXT:** Read fully and follow: `step-02-context-gathering.md`"
- Escalation ([P] or [W]): "**EXITING Quick Dev.** Follow the directed workflow."

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Mode Detection
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-02-context-gathering.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
