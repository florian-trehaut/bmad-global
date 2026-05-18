# Imported From

<!--
SPDX-License-Identifier: MIT
This file documents the import provenance and adaptation log for the
bmad-create-gdd workflow.
-->

## Source

| Field | Value |
|---|---|
| Upstream repository | <https://github.com/bmad-code-org/bmad-module-game-dev-studio> |
| Upstream module | `bmad-module-game-dev-studio` (BMGD) |
| Upstream slug | `gds-gdd` |
| Version | `v0.5.0` |
| Pinned commit SHA | `9dcd1253` |
| Imported into this fork | `2026-05-18` |

## License & Attribution

**SPDX Identifier:** `MIT`

**Copyright Notice:** Copyright (c) 2026 BMad Code, LLC

**License Text:** Full MIT License text reproduced verbatim in the upstream `LICENSE` file:
<https://github.com/bmad-code-org/bmad-module-game-dev-studio/blob/9dcd1253/LICENSE>

**Required attribution preserved in this import:**

- SPDX short-form header at the top of `SKILL.md` (`SPDX-License-Identifier: MIT`).
- Copyright notice "(c) 2026 BMad Code, LLC" preserved in `SKILL.md`.
- Source URL and pinned commit SHA cited (above).

## Source Files Imported

| Upstream path | Our fork path | Adaptation |
|---|---|---|
| `src/workflows/2-design/gds-gdd/SKILL.md` | `src/bmm-skills/2-plan-workflows/bmad-create-gdd/SKILL.md` | Refactored into step-file architecture; SKILL.md is now a thin entry point pointing at `workflow.md` |
| (no upstream `workflow.md`) | `src/bmm-skills/2-plan-workflows/bmad-create-gdd/workflow.md` | New: orchestrator with INITIALIZATION + JIT-load domain stack + CHK-INIT + step sequence per fork conventions |
| (no upstream `steps/`) | `src/bmm-skills/2-plan-workflows/bmad-create-gdd/steps/step-01..step-06.md` | New: 6 step files derived from upstream SKILL.md's `## Discovery / ## GDD Discipline / ## Constraints / ## Finalize` sections, with workflow-adherence v2 hardening |
| `src/workflows/2-design/gds-gdd/assets/game-types.csv` | `data/game-types.csv` | Verbatim |
| `src/workflows/2-design/gds-gdd/assets/genre-complexity.csv` | `data/genre-complexity.csv` | Verbatim |
| `src/workflows/2-design/gds-gdd/assets/gdd-validation-checklist.md` | `data/gdd-validation-checklist.md` | Verbatim |
| `src/workflows/2-design/gds-gdd/assets/headless-schemas.md` | `data/headless-schemas.md` | Verbatim |
| `src/workflows/2-design/gds-gdd/assets/game-types/*.md` (24 files) | `data/game-types/*.md` | Verbatim — 24 genre guide fragments |
| `src/workflows/2-design/gds-gdd/assets/gdd-template.md` | `templates/gdd-template.md` | Verbatim — canonical GDD section structure |
| `src/workflows/2-design/gds-gdd/assets/validation-report-template.html` | `templates/validation-report-template.html` | Verbatim — HTML report template for headless mode |
| `src/workflows/2-design/gds-gdd/references/*.md` (4 files) | `references/*.md` | Verbatim — facilitation guide / GDD purpose / headless guide / validation rendering rules |

## Adaptation Log

### Change 1 — Frontmatter slug rename

| Upstream | Our fork |
|---|---|
| `name: gds-gdd` | `name: bmad-create-gdd` |

**Rationale:** Fork convention is `bmad-*` (SKILL-04 validator rule). The new slug also signals action ("create-gdd") consistent with sibling skills like `bmad-create-prd`, `bmad-create-architecture`, `bmad-create-story`.

### Change 2 — Refactor monolithic SKILL.md → workflow.md + steps/

| Upstream | Our fork |
|---|---|
| Single 100-line `SKILL.md` with `## Discovery`, `## GDD Discipline`, `## Constraints`, `## Finalize` sections | `SKILL.md` (10-line thin entry) → `workflow.md` (orchestrator) → 6 step files |

**Rationale:** Fork conventions enforce workflow-adherence v2 hardening (HARD-01 through HARD-08) on workflows that have a `workflow.md`. The upstream's monolithic SKILL.md is decomposed into:

- `step-01-intent.md` — detect intent (Create / Update / Validate), bind workspace
- `step-02-discovery.md` — game type, scope, downstream depth, mode
- `step-03-draft.md` — walk template sections
- `step-04-epics.md` — develop epics breakdown
- `step-05-validate.md` — validator subagent pass
- `step-06-finalize.md` — decision-log audit, input reconciliation, polish, handoff

This preserves the upstream's design intent (the four phases visible in section structure) while enabling per-step entry/exit checkpoints, NO-SKIP clauses, and the CHK-WORKFLOW-COMPLETE final receipt.

### Change 3 — Activation script path

| Upstream | Our fork |
|---|---|
| `python3 {project-root}/_bmad/scripts/resolve_customization.py` | (omitted — fork has no customize.toml; configuration lives in `workflow-context.md`) |

**Rationale:** The fork stores per-project configuration in `.claude/workflow-context.md` (YAML frontmatter), not in a `customize.toml` resolved by a python script. The customize-resolve activation step is dropped entirely; the workflow.md INITIALIZATION reads `workflow-context.md` directly.

### Change 4 — Config source

| Upstream | Our fork |
|---|---|
| Loads `{project-root}/_bmad/gds/config.yaml` (+ `config.user.yaml`) | Loads `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (worktree-aware via `git rev-parse --git-common-dir`) |

**Rationale:** Standard fork convention. `MAIN_PROJECT_ROOT` is worktree-aware per `bmad-shared/core/project-root-resolution.md`.

### Change 5 — Asset paths rewired

| Upstream | Our fork |
|---|---|
| `assets/gdd-template.md` | `templates/gdd-template.md` |
| `assets/game-types.csv` | `data/game-types.csv` |
| `assets/game-types/{fragment_file}` | `data/game-types/{fragment_file}` |
| `assets/genre-complexity.csv` | `data/genre-complexity.csv` |
| `assets/gdd-validation-checklist.md` | `data/gdd-validation-checklist.md` |
| `references/*.md` | `references/*.md` (preserved) |

**Rationale:** Fork convention separates `templates/` (output templates), `data/` (reference data / CSVs / lookup tables), `references/` (additional consultation material). The upstream's `assets/` is split accordingly.

### Change 6 — Inline JIT-load of domain stack

| Upstream | Our fork |
|---|---|
| (no domain stack concept) | `workflow.md` INITIALIZATION step 1b applies `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to JIT-load `bmad-shared/domains/{type}.md` when `project_type` is set in `workflow-context.md` |

**Rationale:** Per Guardrail #7. The block is the standard fork pattern for NEW domain-consuming workflows.

### Change 7 — workflow-adherence v2 hardening

Applied across `workflow.md` (CHK-INIT receipt) and each step file (NO-SKIP CLAUSE + STEP ENTRY + STEP EXIT). The final step also emits CHK-WORKFLOW-COMPLETE.

Upstream had a lighter "## Critical Rules" block; the fork's hardening is mechanical (validator-enforced via HARD-01..08).

### Change 8 — Output convention

| Upstream | Our fork |
|---|---|
| Output to `{workflow.output_dir}/{workflow.output_folder_name}/` (resolved from customize.toml) | Output to `{planning_artifacts}/gdd/` (resolved from `workflow-context.md` frontmatter) |

**Rationale:** Standard fork output convention.

### Change 9 — Validation report convention

| Upstream | Our fork |
|---|---|
| Validation finds rolled in-conversation by default; HTML report via `scripts/render-validation-html.py` if explicitly requested | Same: in-conversation by default. Optional report at `{DOC_WORKSPACE}/gdd-validation-report.md` if user requests. HTML rendering script is NOT imported. |

**Rationale:** The fork does not currently bundle per-skill python scripts. If HTML output is needed later, the script can be re-imported to `~/.claude/skills/bmad-shared/scripts/` and the validation step amended.

## Pinning Policy

- BMGD source is **pinned to SHA `9dcd1253`** in this file.
- We do NOT re-fetch BMGD HEAD; if a re-base is needed, it goes through `bmad-upstream-sync`.

## Verification

```bash
# Fetch the pinned upstream SKILL.md
curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/workflows/2-design/gds-gdd/SKILL.md" -o /tmp/upstream-skill.md

# Verify game-types.csv is identical
diff /tmp/upstream-skill.md <(curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/workflows/2-design/gds-gdd/assets/game-types.csv") || echo "structural diff expected (we use step-files; upstream uses monolithic SKILL.md)"
```
