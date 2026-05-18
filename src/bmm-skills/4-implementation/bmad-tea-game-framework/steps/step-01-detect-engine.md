---
nextStepFile: './step-02-scaffold-framework.md'
---

# Step 1: Detect Game Engine

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-INIT PASSED emis dans workflow.md INIT
- [ ] `{MAIN_PROJECT_ROOT}` resolu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 01: Detect Game Engine with {main_project_root=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Identify the game engine in use, verify the engine version, and check for existing test framework presence. Bind `{GAME_ENGINE}`, `{ENGINE_VERSION}`, `{TEST_FRAMEWORK}` for downstream steps.

## RULES

- Detection is empirical (file scan), never inferred from the user's description.
- Existing test framework detected → offer upgrade path or HALT. Never silently overwrite.

## SEQUENCE

### 1. Identify Engine Type

Look for engine-specific markers in `{MAIN_PROJECT_ROOT}`:

- **Unity**: presence of `Assets/`, `ProjectSettings/ProjectSettings.asset`, `*.unity` scene files
- **Unreal**: presence of `*.uproject`, `Source/`, `Config/DefaultEngine.ini`
- **Godot**: presence of `project.godot`, `*.tscn`, `*.gd` files

Bind `{GAME_ENGINE}` to the matched engine.

If multiple engines match (rare), present the matches to the user and ask which to target.

**HALT condition:** No engine markers found → "No game engine markers detected at `{MAIN_PROJECT_ROOT}`. Expected one of: `Assets/` (Unity), `*.uproject` (Unreal), `project.godot` (Godot). Verify the project path or run this workflow from inside the game project root."

### 2. Verify Engine Version

For the detected engine:

- **Unity**: Read `ProjectSettings/ProjectVersion.txt` → bind `{ENGINE_VERSION}` to `m_EditorVersion`
- **Unreal**: Read `*.uproject` (JSON) → bind `{ENGINE_VERSION}` to `EngineAssociation`
- **Godot**: Read `project.godot` → bind `{ENGINE_VERSION}` to `config_version`

If the version file is missing, ask the user for the engine version.

### 3. Determine Test Framework

Bind `{TEST_FRAMEWORK}` based on engine:

- **Unity** → `unity-test-framework`
- **Unreal** → `unreal-automation`
- **Godot** → `gut` (Godot Unit Testing)

### 4. Check for Existing Test Framework

Look for existing markers:

- **Unity**: `Assets/Tests/` directory or `*.Tests.asmdef` files
- **Unreal**: `Source/*Tests/` directory or `*Tests.Build.cs` files
- **Godot**: `tests/` directory or `addons/gut/` plugin directory

**If existing framework detected:**

> "I detected an existing {framework} setup at {path}. Options:
> 1. **Upgrade path** — augment the existing setup with missing pieces (safer)
> 2. **Stop** — leave the existing setup as-is; nothing to do
>
> Note: option 1 is non-destructive — it will only add missing files, never overwrite existing ones. Which would you like?"

If user picks Stop: HALT (workflow exits early, no scaffolding written).

If user picks Upgrade: bind `{MODE}` to `upgrade` and continue. The downstream steps will check each file before writing.

If no existing framework: bind `{MODE}` to `fresh` and continue.

### 5. Confirm with user

Echo the detection result:

> "Detected:
> - Engine: {GAME_ENGINE} (version {ENGINE_VERSION})
> - Test framework: {TEST_FRAMEWORK}
> - Mode: {MODE}
> - Test directory: {TEST_DIR}
>
> Proceed with scaffolding? (yes / change / cancel)"

If user picks "change", let them override `{TEST_DIR}` (rare — most engines have fixed conventions, but Godot allows custom test dirs).

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 01: Detect Game Engine
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-02-scaffold-framework.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-02-scaffold-framework.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
