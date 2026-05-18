# Imported From

<!--
SPDX-License-Identifier: MIT
This file documents the import provenance and adaptation log for the
bmad-agent-game-dev skill (Link Freeman).
-->

## Source

| Field | Value |
|---|---|
| Upstream repository | <https://github.com/bmad-code-org/bmad-module-game-dev-studio> |
| Upstream module | `bmad-module-game-dev-studio` (BMGD) |
| Version | `v0.5.0` |
| Pinned commit SHA | `9dcd1253` |
| Pin date | `2026-05-15` |
| Imported into this fork | `2026-05-18` |
| Imported by | Florian TREHAUT (via `bmad-dev-story` for issue `standalone-presets-foundation-and-game-dev-pilot`) |

## License & Attribution

**SPDX Identifier:** `MIT`

**Copyright Notice:** Copyright (c) 2026 BMad Code, LLC

**License Text:** The full MIT License text is reproduced verbatim in the upstream `LICENSE` file:
<https://github.com/bmad-code-org/bmad-module-game-dev-studio/blob/9dcd1253/LICENSE>

**Permission granted by MIT:** Free use, copy, modify, merge, publish, distribute, sublicense, sell — provided this copyright notice and the permission notice appear in all copies or substantial portions of the Software.

**Required attribution preserved in this import:**

- SPDX short-form header at the top of `SKILL.md` (`SPDX-License-Identifier: MIT`).
- Copyright notice "(c) 2026 BMad Code, LLC" preserved.
- Source URL and pinned commit SHA cited (above).
- LICENSE reference link.

## Source Files Imported

| Upstream path | Our fork path | Adaptation |
|---|---|---|
| `src/agents/gds-agent-game-dev/SKILL.md` | `src/bmm-skills/4-implementation/bmad-agent-game-dev/SKILL.md` | DIFF 1, DIFF 2, frontmatter rename, `disable-model-invocation` flag added, JIT-load domain stack inline (per Task 16 / Guardrail #7). `Skill-Specific Notes` section preserved verbatim from upstream. |
| `src/agents/gds-agent-game-dev/customize.toml` | `src/bmm-skills/4-implementation/bmad-agent-game-dev/customize.toml` | `[agent]` table verbatim (persona / role / identity / communication_style / principles preserved per Guardrail #4); menu adapted per TD-6 |

## Adaptation Log

### Change 1 — Frontmatter slug rename

| Upstream | Our fork |
|---|---|
| `name: gds-agent-game-dev` | `name: bmad-agent-game-dev` |

**Rationale:** Our fork's skill-naming convention is `bmad-*` (enforced by SKILL-04 validator rule). The upstream BMGD module uses `gds-*` prefix. Renaming is the minimum-change adaptation to comply with our convention.

### Change 2 — `disable-model-invocation: true` flag added

| Upstream | Our fork |
|---|---|
| (flag not present) | `disable-model-invocation: true` |

**Rationale:** Per Guardrail #10 of the originating story. Our fork's `bmad-agent-*` skills (Winston, Mary, Sally, John, Amelia, Paige, Cloud Dragonborn) all carry this flag to prevent Claude from auto-invoking them as a tool — they should be invoked only on explicit user request. BMGD source does not have this flag because its activation model differs. We ADD this flag (not "preserve") to match the bmad-agent-* convention in this fork.

### Change 3 — DIFF 1: Activation Step 1 path

| Upstream | Our fork |
|---|---|
| `python3 {project-root}/_bmad/scripts/resolve_customization.py --skill {skill-root} --key agent` | `python3 ~/.claude/skills/bmad-shared/scripts/resolve_customization.py --skill {skill-root} --key agent` |

**Rationale:** Our fork installs the `resolve_customization.py` script as part of `bmad-shared` at the global `~/.claude/skills/bmad-shared/scripts/` location, NOT under a project-local `_bmad/scripts/` directory. The upstream path is project-relative; ours is user-global. Adapting the path is mandatory — the script does not exist at the upstream-style path in our fork.

### Change 4 — DIFF 2: Activation Step 5 source (config → workflow-context.md)

| Upstream | Our fork |
|---|---|
| Loads `{project-root}/_bmad/gds/config.yaml` | Loads `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` (worktree-aware via `git rev-parse --git-common-dir`) |

**Rationale:** Our fork stores project configuration in `.claude/workflow-context.md` (YAML frontmatter + markdown body), not in a BMGD-specific `_bmad/gds/config.yaml`. Step 5 is rewritten to use our project-config conventions and includes the worktree-aware resolution rule per `~/.claude/skills/bmad-shared/core/project-root-resolution.md`.

### Change 5 — Menu adaptation (TD-6)

The upstream BMGD menu references 17 skills (16 `gds-*` + `bmad-advanced-elicitation`):

| Upstream menu code | Upstream target skill | Status in our fork | Decision |
|---|---|---|---|
| `DS` | `gds-dev-story` | NOT present | Redirect → `bmad-dev-story` (direct mapping) |
| `CR` | `gds-code-review` | NOT present | Redirect → `bmad-code-review` (direct mapping) |
| `QD` | `gds-quick-dev` | NOT present | Redirect → `bmad-quick-dev` (direct mapping) |
| `CS` | `gds-create-story` | NOT present | Redirect → `bmad-create-story` (direct mapping) |
| `SP` | `gds-sprint-planning` | NOT present | Redirect → `bmad-sprint-planning` (direct mapping) |
| `SS` | `gds-sprint-status` | NOT present | Redirect → `bmad-sprint-status` (direct mapping) |
| `CC` | `gds-correct-course` | NOT present | Redirect → `bmad-correct-course` (direct mapping) |
| `ER` | `gds-retrospective` | NOT present | Redirect → `bmad-retrospective` (direct mapping) |
| `TF` | `gds-test-framework` | NOT present | Redirect → `bmad-tea-framework` (closest bmm equivalent — Unity/Unreal/Godot specifics come via domain stack) |
| `TD` | `gds-test-design` | NOT present | Redirect → `bmad-test-design` (direct mapping) |
| `TA` | `gds-test-automate` | NOT present | Redirect → `bmad-tea-automate` (closest bmm equivalent) |
| `ES` | `gds-e2e-scaffold` | NOT present | Redirect → `bmad-qa-generate-e2e-tests` (closest bmm equivalent) |
| `PP` | `gds-playtest-plan` | NOT present | UNBOUND (Option B in TD-6) — playtest is game-specific (qualitative human evaluation); no acceptable bmm substitute. Prompt-only menu item engages the user conversationally and captures a playtest plan working document under `{planning_artifacts}`. |
| `PT` | `gds-performance-test` | NOT present | Redirect → `bmad-nfr-assess` (closest bmm equivalent — engine-specific budgets come via domain stack) |
| `TR` | `gds-test-review` | NOT present | Redirect → `bmad-tea-test-review` (direct mapping) |
| `IN` | `gds-investigate` | NOT present | Redirect → `bmad-troubleshoot` (closest bmm equivalent — shares evidence-based-debugging mandate) |
| `AE` | `bmad-advanced-elicitation` | EXISTS in this fork | Direct — same skill name in both upstream and fork |

**Rationale:** Per Guardrail #4 of the originating story, the BMGD persona content (role / identity / communication_style / principles) is preserved verbatim from SHA `9dcd1253`. The menu, however, is configuration — not persona — and the upstream menu items target skills that do not exist in this fork. 15 of 17 items redirect to existing bmm-* equivalents; 1 (`PP` playtest) is left as prompt-only because no acceptable bmm substitute exists. Per-item decisions are documented as TOML comments above each `[[agent.menu]]` block in `customize.toml`.

### Change 6 — Inline JIT-load of domain stack in Step 5

| Upstream | Our fork |
|---|---|
| (no domain stack concept) | Activation Step 5 includes an inline sub-step: after loading `workflow-context.md`, if `project_type` is set, apply `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to JIT-load `bmad-shared/domains/{type}.md` |

**Rationale:** Per Task 16 / Guardrail #7 of the originating story, ALL agent SKILL.md activation sections include the JIT-load block. The block is added as a sub-step inside Step 5 (after `workflow-context.md` load — required ordering since `project_type` lives in that file). This is independent of the BMGD import (the upstream has no domain stack concept); the inline block exists for cross-fork uniformity.

### Note on the `Skill-Specific Notes` section

The upstream SKILL.md ends with a `## Skill-Specific Notes` section listing 5 bullets about QA/testing knowledge fragments (`{skill-root}/gametest/qa-index.csv` and `{skill-root}/gametest/knowledge/*.md`). These knowledge files are NOT imported in this story (only the agent skeleton — SKILL.md + customize.toml — is being imported). The bullets reference paths that do not yet exist under this skill's `{skill-root}`. The section is preserved verbatim because:

1. It is part of the persona / behavioral guidance (Guardrail #4 preservation).
2. Bullets degrade gracefully — Link will simply notice the paths do not exist and proceed without them (Zero False Data rule: he will not fabricate test knowledge).
3. When `gametest/` knowledge fragments are imported in a later story, the bullets will become active without further SKILL.md changes.

## Pinning Policy

Per Guardrail #5 of the originating story:

- BMGD source is **pinned to SHA `9dcd1253`** in this file and in source citations within `domains/game-dev.md`.
- We do NOT re-fetch BMGD HEAD during the originating story's implementation (R-2 risk mitigation).
- If BMGD ships v0.6.0 (or a later release) during this story's implementation window, the divergence is documented in the PR description; the re-base is deferred to a follow-up story.
- Future re-syncs go through `bmad-upstream-sync` (which this fork already has) or a dedicated re-import flow.

## Verification

To verify this import has not drifted from the upstream pinned source:

```bash
# Fetch the pinned upstream SKILL.md
curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/agents/gds-agent-game-dev/SKILL.md" -o /tmp/upstream-skill.md

# Diff the persona-defining body sections only (Overview, persona attributes — NOT activation steps which have local adaptations)
diff <(grep -A 10 "^## Overview" /tmp/upstream-skill.md) <(grep -A 10 "^## Overview" SKILL.md)
```

Expected: zero diff in the `## Overview` section (persona text preserved verbatim per Guardrail #4).
