# Imported From

<!--
SPDX-License-Identifier: MIT
This file documents the import provenance and adaptation log for the
bmad-create-narrative workflow.
-->

## Source

| Field | Value |
|---|---|
| Upstream repository | <https://github.com/bmad-code-org/bmad-module-game-dev-studio> |
| Upstream module | `bmad-module-game-dev-studio` (BMGD) |
| Upstream slug | `gds-create-narrative` |
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
| `src/workflows/2-design/gds-create-narrative/SKILL.md` | `src/bmm-skills/2-plan-workflows/bmad-create-narrative/SKILL.md` | Frontmatter rename + MIT block + thin pointer to `workflow.md` |
| (no upstream `workflow.md`) | `workflow.md` | New: orchestrator with INITIALIZATION + JIT-load domain stack + CHK-INIT + step sequence |
| `src/workflows/2-design/gds-create-narrative/steps/step-01-init.md` | `steps/step-01-init.md` | Frontmatter stripped (STEP-06), NO-SKIP + ENTRY/EXIT hardening added, paths rewired |
| `src/workflows/2-design/gds-create-narrative/steps/step-01b-continue.md` | `steps/step-01b-continue.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-02-foundation.md` | `steps/step-02-foundation.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-03-story.md` | `steps/step-03-story.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-04-characters.md` | `steps/step-04-characters.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-05-world.md` | `steps/step-05-world.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-06-dialogue.md` | `steps/step-06-dialogue.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-07-environmental.md` | `steps/step-07-environmental.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-08-delivery.md` | `steps/step-08-delivery.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-09-integration.md` | `steps/step-09-integration.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-10-production.md` | `steps/step-10-production.md` | Same adaptations |
| `src/workflows/2-design/gds-create-narrative/steps/step-11-complete.md` | `steps/step-11-complete.md` | Same adaptations + CHK-WORKFLOW-COMPLETE block appended |
| `src/workflows/2-design/gds-create-narrative/templates/narrative-template.md` | `templates/narrative-template.md` | Verbatim |
| `src/workflows/2-design/gds-create-narrative/checklist.md` | `data/checklist.md` | Verbatim |

## Adaptation Log

### Change 1 — Frontmatter slug rename

`name: gds-create-narrative` → `name: bmad-create-narrative` (fork convention SKILL-04).

### Change 2 — Refactor SKILL.md → workflow.md + steps/

Upstream `SKILL.md` carried the `## On Activation` block + `## WORKFLOW ARCHITECTURE` rules. The fork separates this into:
- `SKILL.md` — 10-line thin entry pointing at `workflow.md`
- `workflow.md` — INITIALIZATION (loads `workflow-context.md` + JIT-loads domain stack + CHK-INIT) + workflow rules + step sequence
- `steps/step-NN-*.md` — verbatim upstream step files, transformed with hardening

### Change 3 — Step file path substitutions

| Upstream | Our fork |
|---|---|
| `{installed_path}` (frontmatter variable) | `.` (workflow root, relative paths) |
| `{output_folder}` (BMGD config var) | `{planning_artifacts}` (fork workflow-context variable) |
| `{outputFile}` | `{planning_artifacts}/narrative-design.md` |
| `'skill:bmad-advanced-elicitation'` | `~/.claude/skills/bmad-advanced-elicitation/SKILL.md` |
| `'skill:bmad-party-mode'` | `~/.claude/skills/bmad-party-mode/SKILL.md` |
| `{workflowFile}` | `./workflow.md` |
| `{continueStepFile}` | `./step-01b-continue.md` |
| `{nextStepFile}` | actual relative path per step |

### Change 4 — Step file frontmatter stripped (STEP-06 rule)

Upstream step files had `name:` and `description:` keys in their YAML frontmatter (e.g., `name: 'step-01-init'`). Fork rule STEP-06 forbids `name`/`description` in step frontmatter. Stripped from every step; the only remaining frontmatter key is `nextStepFile: '<path>'`.

### Change 5 — workflow-adherence v2 hardening on every step

Per HARD-03/04/05/07/08, each step file now contains:
- **At top (after H1)**: NO-SKIP CLAUSE block + STEP ENTRY (CHK-STEP-NN-ENTRY)
- **At bottom**: STEP EXIT (CHK-STEP-NN-EXIT) + canonical "Read FULLY and apply" Next: phrasing

The upstream "Progress: Step N of 11" header line + "Master Rule:" footer line are stripped — they conflict with the fork's hardening style.

### Change 6 — CHK-WORKFLOW-COMPLETE on step-11

Per HARD-06, the final step must emit a CHK-WORKFLOW-COMPLETE receipt enumerating all CHK-STEP-NN-EXIT emissions. Block appended at the end of `step-11-complete.md`.

### Change 7 — JIT-load domain stack in workflow.md INIT

Per Guardrail #7, the workflow's INIT block 1b applies `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to JIT-load `bmad-shared/domains/{type}.md` when `project_type` is set.

### Change 8 — Output convention

Output narrative document: `{planning_artifacts}/narrative-design.md` (replaces upstream `{output_folder}/narrative-design.md`).

## Pinning Policy

- BMGD source is **pinned to SHA `9dcd1253`** in this file.
- We do NOT re-fetch BMGD HEAD; if a re-base is needed, it goes through `bmad-upstream-sync`.

## Verification

```bash
diff <(curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/workflows/2-design/gds-create-narrative/templates/narrative-template.md") templates/narrative-template.md
# expected: zero diff (template imported verbatim)
```
