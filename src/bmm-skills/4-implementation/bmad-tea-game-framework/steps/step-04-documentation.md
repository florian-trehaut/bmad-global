# Step 4: Generate Documentation

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-03-EXIT emis dans la conversation
- [ ] Samples generated and parse-verified

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 04: Generate Documentation with {game_engine=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate `tests/README.md` (or engine-appropriate location) documenting the test framework, how to run tests, CI integration, and references. Validate against the checklist. Present deliverables.

## SEQUENCE

### 1. Determine README location

- **Unity**: `Assets/Tests/README.md`
- **Unreal**: `Source/<ProjectName>Tests/README.md`
- **Godot**: `tests/README.md`

### 2. Generate README content

Build the README with these sections:

```markdown
# Test Framework — {PROJECT_NAME}

This project uses {TEST_FRAMEWORK} for automated testing.

## Overview

| Aspect | Value |
|--------|-------|
| Engine | {GAME_ENGINE} |
| Engine version | {ENGINE_VERSION} |
| Test framework | {TEST_FRAMEWORK} |
| Test directory | {TEST_DIR} |

## Directory Structure

{engine-specific directory tree}

## Running Tests Locally

{engine-specific run instructions}

### Unity
Open the Unity Editor → Window → General → Test Runner. Run EditMode or PlayMode tests.

### Unreal
Editor → Tools → Session Frontend → Automation tab. Filter by `<ProjectName>.*`.

### Godot
With the GUT plugin installed:
```
godot --headless -s addons/gut/gut_cmdln.gd -gconfig=gut_config.json
```

## CI Integration

{engine-specific CI commands — Unity Hub CLI / Unreal Build / Godot headless}

## Best Practices for Game Testing

- Mock heavy engine dependencies in unit tests; reserve PlayMode / play-mode tests for integration scenarios.
- Use deterministic seeds for tests that touch random number generation.
- Keep play-mode tests focused — long scenarios become flaky.
- Test feel parameters (jump heights, hit boxes, frame data) as code, not by-eye.

## Sample Tests Included

- `{path/to/unit-sample}` — example unit test for {feature}
- `{path/to/integration-sample}` — example {play-mode / integration} test for {feature}

Replace the sample classes (e.g., `DamageCalculator`, `PlayerController`) with classes from your actual game, or delete the samples after reviewing.

## References

- Engine docs: {engine-specific URL}
- Framework docs: {framework-specific URL}
```

Fill in engine-specific details from steps 01-03.

### 3. Validate against checklist

Read `data/checklist.md`. Walk through each item:

- Engine detected and version captured?
- Directory structure created?
- Config files generated and valid?
- Sample tests generated and parse-verified?
- README written with run + CI instructions?

For each "no", resolve before finalizing.

### 4. Present deliverables

Tell the user:

> "Game test framework scaffolded.
>
> **Engine detected:** {GAME_ENGINE} ({ENGINE_VERSION})
> **Framework:** {TEST_FRAMEWORK}
> **Mode:** {MODE}
>
> **Artifacts created:**
> - Test directory structure
> - Framework configuration (asmdef / Build.cs / gut_config.json)
> - Sample unit tests
> - Sample integration / play-mode tests
> - `{README_PATH}`
>
> **Next steps:**
> 1. Review sample tests and adapt to your game (or delete them).
> 2. Run initial tests to verify setup.
> 3. Use `bmad-test-design` workflow to plan comprehensive test coverage.
> 4. Use `bmad-tea-automate` workflow to generate additional tests."

---

## END OF WORKFLOW

The bmad-tea-game-framework workflow is complete.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 04: Generate Documentation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: WORKFLOW-COMPLETE
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-tea-game-framework executed end-to-end:
  steps_executed: ['01', '02', '03', '04']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: ['{TEST_DIR}/...', '{README_PATH}']
```

Si steps_executed != ['01', '02', '03', '04'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
