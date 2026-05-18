# Imported From

<!--
SPDX-License-Identifier: MIT
This file documents the import provenance and adaptation log for the
bmad-tea-game-framework workflow.
-->

## Source

| Field | Value |
|---|---|
| Upstream repository | <https://github.com/bmad-code-org/bmad-module-game-dev-studio> |
| Upstream module | `bmad-module-game-dev-studio` (BMGD) |
| Upstream slug | `gds-test-framework` |
| Version | `v0.5.0` |
| Pinned commit SHA | `9dcd1253` |
| Imported into this fork | `2026-05-18` |

## License & Attribution

**SPDX Identifier:** `MIT`
**Copyright Notice:** Copyright (c) 2026 BMad Code, LLC
**License Text:** <https://github.com/bmad-code-org/bmad-module-game-dev-studio/blob/9dcd1253/LICENSE>

## Source Files Imported

| Upstream path | Our fork path | Adaptation |
|---|---|---|
| `src/workflows/gametest/gds-test-framework/SKILL.md` | `src/bmm-skills/4-implementation/bmad-tea-game-framework/SKILL.md` | Refactored into step-file architecture; SKILL.md is now a thin entry point |
| (no upstream `workflow.md`) | `workflow.md` | New: orchestrator with INITIALIZATION + JIT-load domain stack + CHK-INIT |
| (upstream embeds steps in SKILL.md) | `steps/step-01-detect-engine.md` through `steps/step-04-documentation.md` | New: 4 step files derived from upstream SKILL.md's `### Step 1` through `### Step 4` |
| `src/workflows/gametest/gds-test-framework/checklist.md` | `data/checklist.md` | Verbatim |

## Adaptation Log

### Change 1 — Frontmatter slug rename

`name: gds-test-framework` → `name: bmad-tea-game-framework`

**Rationale:** Fork convention `bmad-*`. The "tea" infix matches the fork's existing test-engineering-agent (TEA) family: `bmad-tea-framework`, `bmad-tea-automate`, `bmad-tea-ci`, `bmad-tea-atdd`, `bmad-tea-trace`, `bmad-tea-test-review`. The "-game" suffix distinguishes this from the generic `bmad-tea-framework`. The fork now has TWO test-framework workflows:
- `bmad-tea-framework` — generic / web / backend project test framework setup
- `bmad-tea-game-framework` — game engine (Unity / Unreal / Godot) test framework setup

### Change 2 — Refactor monolithic SKILL.md → workflow.md + steps/

Upstream `SKILL.md` is ~440 lines with embedded `### Step 1` through `### Step 4` sections. Fork decomposes:
- `SKILL.md` — thin entry pointer
- `workflow.md` — orchestrator (INITIALIZATION + JIT-load + CHK-INIT + step sequence)
- 4 step files mapping to the 4 upstream `### Step N:` sections

### Change 3 — Activation script path

Upstream `python3 {project-root}/_bmad/scripts/resolve_customization.py` activation removed entirely. Fork uses `workflow-context.md`.

### Change 4 — Config source

Upstream `{project-root}/_bmad/gds/config.yaml` → `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md`.

### Change 5 — `knowledge/{engine}-testing.md` references removed

Upstream references `knowledge/unity-testing.md`, `knowledge/unreal-testing.md`, `knowledge/godot-testing.md` as knowledge base fragments. These files are not bundled by the upstream workflow — they live in the BMGD module's parent knowledge directory. Fork does not currently import these knowledge files; the per-engine test patterns are inlined in the step files themselves (which already covered most of the substance).

### Change 6 — JIT-load domain stack

`workflow.md` INIT step 1b applies `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md`. For game-dev projects, this loads the game-dev domain stack with engine-specific guidance.

### Change 7 — workflow-adherence v2 hardening

CHK-INIT in workflow.md, NO-SKIP + ENTRY/EXIT in every step, CHK-WORKFLOW-COMPLETE on step-04.

### Change 8 — Upgrade-path mode

Upstream's "Existing test framework detected → HALT or upgrade" is preserved and extended: step-01 explicitly binds `{MODE} = fresh | upgrade`, and subsequent steps check-before-write in upgrade mode to avoid destructive overwrites. This is a tightening of the upstream rule, not a deviation.

### Change 9 — Test directory default

`{TEST_DIR}` default is `{MAIN_PROJECT_ROOT}/tests` (upstream `{project-root}/tests`). For Unity, this is overridden to `Assets/Tests/` per Unity convention (Tests outside of `Assets/` cannot be discovered by Unity's Test Runner).

## Pinning Policy

- BMGD source is **pinned to SHA `9dcd1253`** in this file.

## Verification

```bash
diff <(curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/workflows/gametest/gds-test-framework/checklist.md") data/checklist.md
# expected: zero diff
```
