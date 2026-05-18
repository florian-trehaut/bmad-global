# Imported From

<!--
SPDX-License-Identifier: MIT
This file documents the import provenance and adaptation log for the
bmad-playtest-plan workflow.
-->

## Source

| Field | Value |
|---|---|
| Upstream repository | <https://github.com/bmad-code-org/bmad-module-game-dev-studio> |
| Upstream module | `bmad-module-game-dev-studio` (BMGD) |
| Upstream slug | `gds-playtest-plan` |
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
| `src/workflows/gametest/gds-playtest-plan/SKILL.md` | `src/bmm-skills/4-implementation/bmad-playtest-plan/SKILL.md` | Refactored into step-file architecture; SKILL.md is now a thin entry point pointing at `workflow.md` |
| (no upstream `workflow.md`) | `workflow.md` | New: orchestrator with INITIALIZATION + JIT-load domain stack + CHK-INIT |
| (upstream embeds steps in SKILL.md) | `steps/step-01-objectives.md` through `steps/step-06-analysis-framework.md` | New: 6 step files derived from upstream SKILL.md's `### Step 1: Define Playtest Objectives` through `### Step 6: Post-Playtest Analysis Framework`, with workflow-adherence v2 hardening |
| `src/workflows/gametest/gds-playtest-plan/playtest-template.md` | `templates/playtest-template.md` | Verbatim |
| `src/workflows/gametest/gds-playtest-plan/checklist.md` | `data/checklist.md` | Verbatim |

## Adaptation Log

### Change 1 — Frontmatter slug rename

`name: gds-playtest-plan` → `name: bmad-playtest-plan` (fork convention SKILL-04).

### Change 2 — Refactor monolithic SKILL.md → workflow.md + steps/

The upstream `SKILL.md` is ~400 lines with embedded `### Step 1` through `### Step 6` sections. The fork decomposes:
- `SKILL.md` — thin entry pointer
- `workflow.md` — orchestrator (INITIALIZATION + JIT-load + CHK-INIT + step sequence)
- 6 step files mapping to the 6 upstream `### Step N:` sections — each rewritten with the standard fork hardening (NO-SKIP + STEP ENTRY + STEP EXIT) and progressive output building

This preserves the upstream's design intent while enabling validator HARD-01..08 enforcement.

### Change 3 — Activation script path

Upstream `python3 {project-root}/_bmad/scripts/resolve_customization.py` activation is removed entirely. The fork uses `workflow-context.md` (no customize.toml model).

### Change 4 — Config source

Upstream `{project-root}/_bmad/gds/config.yaml` → `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (worktree-aware).

### Change 5 — Output paths

Output path: `{implementation_artifacts}/playtest-plan.md` (was `{output_folder}/playtest-plan.md` upstream). The fork's `implementation_artifacts` variable maps to the phase 4 output folder.

### Change 6 — JIT-load domain stack

`workflow.md` INIT step 1b applies `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md`.

### Change 7 — workflow-adherence v2 hardening

CHK-INIT in workflow.md, NO-SKIP + ENTRY/EXIT in every step, CHK-WORKFLOW-COMPLETE on step-06.

### Change 8 — `knowledge/playtesting.md` reference removed

Upstream references `knowledge/playtesting.md` as a knowledge base. This file is NOT bundled in the upstream workflow — it lives elsewhere in the BMGD module. The fork does not currently import that knowledge file; if needed later, it can be added under `data/`.

### Change 9 — Time estimates in observation tables

Upstream tables show "Duration: 30-60 minutes", "Duration: 1-2 hours", etc. Per fork rule SEQ-02 (no time estimates), these are softened to qualitative descriptors ("Short, repeatable", "Longer, single session", "Shorter, single feature") in the workflow content. The original concrete examples remain in the upstream template (`playtest-template.md`) which is preserved verbatim — those are illustrative.

## Pinning Policy

- BMGD source is **pinned to SHA `9dcd1253`** in this file.

## Verification

```bash
diff <(curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/workflows/gametest/gds-playtest-plan/playtest-template.md") templates/playtest-template.md
# expected: zero diff
```
