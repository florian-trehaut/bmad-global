---
nextStepFile: './step-04-documentation.md'
---

# Step 3: Generate Sample Tests

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-02-EXIT emis dans la conversation
- [ ] Directory structure et fichiers de config crees

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 03: Generate Sample Tests with {game_engine=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Generate working sample tests for the detected engine — unit tests + integration / play-mode tests. The samples must compile / parse against the engine version detected in step 01.

## SEQUENCE

### 1. Generate Unity samples (if Unity)

Generate `Assets/Tests/EditMode/ExampleEditModeTest.cs`:

```csharp
using NUnit.Framework;

[TestFixture]
public class DamageCalculatorTests
{
    [Test]
    public void Calculate_BaseDamage_ReturnsCorrectValue()
    {
        // Arrange
        var calculator = new DamageCalculator();

        // Act
        float result = calculator.Calculate(100f, 1f);

        // Assert
        Assert.AreEqual(100f, result);
    }
}
```

Generate `Assets/Tests/PlayMode/ExamplePlayModeTest.cs`:

```csharp
using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class PlayerMovementTests
{
    [UnityTest]
    public IEnumerator Player_WhenInputApplied_Moves()
    {
        // Arrange
        var playerGO = new GameObject("Player");
        var controller = playerGO.AddComponent<PlayerController>();

        // Act
        controller.SetMoveInput(Vector2.right);
        yield return new WaitForSeconds(0.5f);

        // Assert
        Assert.Greater(playerGO.transform.position.x, 0f);

        // Cleanup
        Object.Destroy(playerGO);
    }
}
```

Tell the user: "Sample tests reference `DamageCalculator` and `PlayerController` — replace these with classes from your game, or delete the samples after reviewing."

### 2. Generate Unreal samples (if Unreal)

Generate `Source/<ProjectName>Tests/Private/DamageCalculationTests.cpp`:

```cpp
#include "Misc/AutomationTest.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(
    FDamageCalculationTest,
    "<ProjectName>.Combat.DamageCalculation",
    EAutomationTestFlags::ApplicationContextMask |
    EAutomationTestFlags::ProductFilter
)

bool FDamageCalculationTest::RunTest(const FString& Parameters)
{
    // Arrange
    float BaseDamage = 100.f;
    float CritMultiplier = 2.f;

    // Act
    float Result = UDamageCalculator::Calculate(BaseDamage, CritMultiplier);

    // Assert
    TestEqual("Critical hit doubles damage", Result, 200.f);

    return true;
}
```

Replace `<ProjectName>` placeholder with the project name from step 01.

### 3. Generate Godot samples (if Godot)

Generate `tests/unit/test_damage_calculator.gd`:

```gdscript
extends GutTest

var calculator: DamageCalculator

func before_each():
    calculator = DamageCalculator.new()

func after_each():
    calculator.free()

func test_calculate_base_damage():
    var result = calculator.calculate(100.0, 1.0)
    assert_eq(result, 100.0, "Base damage should equal input")

func test_calculate_critical_hit():
    var result = calculator.calculate(100.0, 2.0)
    assert_eq(result, 200.0, "Critical hit should double damage")
```

### 4. Upgrade mode — check before write

If `{MODE} = upgrade`: For each sample file, check if a file with the same name exists. If yes, do NOT overwrite; instead, log a suggested path with `.example.<ext>` suffix and ask the user.

### 5. Verify samples parse

For each generated sample, do a basic syntax check:
- Unity (.cs): brace matching, `using` statements, attribute syntax
- Unreal (.cpp): brace matching, semicolons, `IMPLEMENT_*_AUTOMATION_TEST` macro
- Godot (.gd): indentation consistent, `extends GutTest` present, `func test_*` naming

If any sample fails the parse check, fix in place before continuing.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 03: Generate Sample Tests
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-04-documentation.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-04-documentation.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
