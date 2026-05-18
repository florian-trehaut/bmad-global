---
nextStepFile: './step-03-generate-samples.md'
---

# Step 2: Scaffold Framework

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-01-EXIT emis dans la conversation
- [ ] `{GAME_ENGINE}`, `{TEST_FRAMEWORK}`, `{MODE}`, `{TEST_DIR}` bound

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 02: Scaffold Framework with {game_engine=…, mode=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Create the test directory structure and engine-appropriate configuration files. In Upgrade mode, only write files that do not already exist.

## SEQUENCE

### 1. Branch by engine

#### Unity Test Framework

Create directory structure under `Assets/Tests/`:

```
Assets/
├── Tests/
│   ├── EditMode/
│   │   └── EditModeTests.asmdef
│   └── PlayMode/
│       └── PlayModeTests.asmdef
```

Generate `Assets/Tests/EditMode/EditModeTests.asmdef`:

```json
{
  "name": "EditModeTests",
  "references": ["<GameAssembly>"],
  "includePlatforms": ["Editor"],
  "defineConstraints": ["UNITY_INCLUDE_TESTS"],
  "optionalUnityReferences": ["TestAssemblies"]
}
```

Generate `Assets/Tests/PlayMode/PlayModeTests.asmdef`:

```json
{
  "name": "PlayModeTests",
  "references": ["<GameAssembly>"],
  "includePlatforms": [],
  "defineConstraints": ["UNITY_INCLUDE_TESTS"],
  "optionalUnityReferences": ["TestAssemblies"]
}
```

Replace `<GameAssembly>` with the detected Unity assembly name (e.g., the project name or `Assembly-CSharp` default).

#### Unreal Engine Automation

Detect `<ProjectName>` from `*.uproject` filename. Create:

```
Source/
└── <ProjectName>Tests/
    ├── <ProjectName>Tests.Build.cs
    └── Private/
```

Generate `Source/<ProjectName>Tests/<ProjectName>Tests.Build.cs`:

```csharp
using UnrealBuildTool;

public class <ProjectName>Tests : ModuleRules
{
    public <ProjectName>Tests(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[] {
            "Core",
            "CoreUObject",
            "Engine",
            "<ProjectName>"
        });

        PrivateDependencyModuleNames.AddRange(new string[] {
            "AutomationController"
        });
    }
}
```

#### Godot GUT Framework

Create structure:

```
addons/gut/   (note: user must install GUT plugin from AssetLib — we create the placeholder)
tests/
├── unit/
└── integration/
gut_config.json
```

Generate `gut_config.json`:

```json
{
  "dirs": ["res://tests/"],
  "include_subdirs": true,
  "prefix": "test_",
  "suffix": ".gd",
  "should_exit": true,
  "should_exit_on_success": true,
  "log_level": 1,
  "junit_xml_file": "results.xml"
}
```

Tell the user: "GUT plugin must be installed from Godot AssetLib. The directory `addons/gut/` is reserved for it."

### 2. Upgrade mode — check before write

If `{MODE} = upgrade`:

For each file the scaffold would write, check if it already exists. If yes, skip; if no, write. Report a summary at the end: "Created N new files; skipped M existing files."

### 3. Verify structure

After writing, list the created directories and files. Confirm with user the scaffold matches the engine conventions.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 02: Scaffold Framework
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-03-generate-samples.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-03-generate-samples.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
