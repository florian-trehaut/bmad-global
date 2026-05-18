# Imported From

<!--
SPDX-License-Identifier: MIT
This file documents the import provenance and adaptation log for the
bmad-check-readiness-game workflow.
-->

## Source

| Field | Value |
|---|---|
| Upstream repository | <https://github.com/bmad-code-org/bmad-module-game-dev-studio> |
| Upstream module | `bmad-module-game-dev-studio` (BMGD) |
| Upstream slug | `gds-check-implementation-readiness` |
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
| `src/workflows/3-technical/gds-check-implementation-readiness/SKILL.md` | `src/bmm-skills/3-solutioning/bmad-check-readiness-game/SKILL.md` | Frontmatter rename + MIT block + thin pointer to `workflow.md` |
| (no upstream `workflow.md`) | `workflow.md` | New: orchestrator with INITIALIZATION + JIT-load domain stack + CHK-INIT |
| `src/workflows/3-technical/gds-check-implementation-readiness/steps/step-01-document-discovery.md` | `steps/step-01-document-discovery.md` | Frontmatter normalized, NO-SKIP + ENTRY/EXIT hardening added |
| `steps/step-02-gdd-analysis.md` | `steps/step-02-gdd-analysis.md` | Same |
| `steps/step-03-epic-coverage-validation.md` | `steps/step-03-epic-coverage-validation.md` | Same |
| `steps/step-04-ux-alignment.md` | `steps/step-04-ux-alignment.md` | Same |
| `steps/step-05-epic-quality-review.md` | `steps/step-05-epic-quality-review.md` | Same |
| `steps/step-06-final-assessment.md` | `steps/step-06-final-assessment.md` | Same + CHK-WORKFLOW-COMPLETE block appended |
| `templates/readiness-report-template.md` | `templates/readiness-report-template.md` | Verbatim |

## Adaptation Log

### Change 1 — Frontmatter slug rename

`name: gds-check-implementation-readiness` → `name: bmad-check-readiness-game`

**Rationale:** Fork convention `bmad-*`. The "-game" suffix distinguishes this from the existing `bmad-check-readiness` workflow (which is for generic projects). The fork now has TWO readiness workflows:
- `bmad-check-readiness` — generic (PRD / Architecture / UX / Stories alignment)
- `bmad-check-readiness-game` — game-specific (GDD / Game Architecture / UX / Epics alignment, with epic-coverage-validation against GDD mechanics)

### Change 2 — SKILL.md → workflow.md + steps/

Upstream `SKILL.md` carried the `## On Activation` block + `## WORKFLOW ARCHITECTURE` rules. Fork separates:
- `SKILL.md` — thin entry point
- `workflow.md` — orchestrator
- `steps/step-NN-*.md` — verbatim upstream step files, hardened

### Change 3 — Step file path substitutions

| Upstream | Our fork |
|---|---|
| `{installed_path}` | `.` (relative) |
| `{output_folder}` | `{planning_artifacts}` |
| `{module_config}` | `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` |
| `{workflowFile}` | `./workflow.md` |
| `{nextStepFile}` | actual relative path per step |

### Change 4 — Output convention

Output report: `{planning_artifacts}/implementation-readiness-report.md` (replaces upstream `{planning_artifacts}/implementation-readiness-report-{{date}}.md` — the fork drops the date suffix since it is regenerated on re-runs, like other readiness reports).

### Change 5 — workflow-adherence v2 hardening

Applied per HARD-01..06: CHK-INIT in workflow.md, NO-SKIP + STEP ENTRY + STEP EXIT in each step file, CHK-WORKFLOW-COMPLETE in step-06.

### Change 6 — Step file frontmatter normalized

Upstream step files had `name:` and `description:` keys (forbidden by STEP-06). Stripped; `nextStepFile`, `outputFile`, `templateFile` preserved.

### Change 7 — JIT-load domain stack

`workflow.md` INIT step 1b applies `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to JIT-load `bmad-shared/domains/{type}.md` when `project_type` is set (typically `game-dev` for this workflow).

## Pinning Policy

- BMGD source is **pinned to SHA `9dcd1253`** in this file.

## Verification

```bash
diff <(curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/workflows/3-technical/gds-check-implementation-readiness/templates/readiness-report-template.md") templates/readiness-report-template.md
# expected: zero diff
```
