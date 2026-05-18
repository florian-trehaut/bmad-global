# Imported From

<!--
SPDX-License-Identifier: MIT
This file documents the import provenance and adaptation log for the
bmad-agent-game-tech-writer skill (Paige, game flavour).
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

## Coexistence with `bmad-agent-tech-writer`

The fork already has a `bmad-agent-tech-writer` (Paige, non-game flavour) under `src/bmm-skills/1-analysis/bmad-agent-tech-writer/`. The current import (`bmad-agent-game-tech-writer`) is the **game-flavoured** variant from BMGD with:

- A different frontmatter `name:` slug (`bmad-agent-game-tech-writer`) so both can be installed side-by-side without collision.
- A persona Overview that explicitly mentions "game development concepts" (verbatim from BMGD upstream).
- `documentation-standards.md` loaded as a persistent fact (per BMGD persistent_facts spec).
- A menu tuned for game documentation work (game-project doc, GDD-aware writing, mermaid for game systems diagrams).

The two skills are activated by different user intents:

- "talk to Paige" + no game context → resolve to `bmad-agent-tech-writer` (general).
- "talk to Paige" + game-dev domain stack OR explicit "game tech writer" request → resolve to `bmad-agent-game-tech-writer`.

The frontmatter `name` is the slug (different); the persona `name` in `customize.toml` is the same ("Paige") — this is intentional and matches the BMGD convention.

## Source Files Imported

| Upstream path | Our fork path | Adaptation |
|---|---|---|
| `src/agents/gds-agent-tech-writer/SKILL.md` | `src/bmm-skills/1-analysis/bmad-agent-game-tech-writer/SKILL.md` | DIFF 1, DIFF 2, frontmatter rename (`gds-` → `bmad-game-`), title disambiguation (`Technical Writer` → `Game Technical Writer` in H1), `disable-model-invocation` flag added, JIT-load domain stack inline (per Task 16 / Guardrail #7) |
| `src/agents/gds-agent-tech-writer/customize.toml` | `src/bmm-skills/1-analysis/bmad-agent-game-tech-writer/customize.toml` | `[agent]` table verbatim (persona / role / identity / communication_style / principles preserved per Guardrail #4); menu adapted per TD-6 |

**Files NOT imported by this story** (deliberately deferred to a follow-up — this story imports the agent skeleton only):

| Upstream path | Status | Note |
|---|---|---|
| `src/agents/gds-agent-tech-writer/write-document.md` | NOT imported | Referenced by menu code `WD` — replaced by inline prompt in `customize.toml` |
| `src/agents/gds-agent-tech-writer/update-standards.md` | NOT imported | Referenced by menu code `US` — replaced by inline prompt |
| `src/agents/gds-agent-tech-writer/mermaid-gen.md` | NOT imported | Referenced by menu code `MG` — replaced by inline prompt |
| `src/agents/gds-agent-tech-writer/validate-doc.md` | NOT imported | Referenced by menu code `VD` — replaced by inline prompt |
| `src/agents/gds-agent-tech-writer/explain-concept.md` | NOT imported | Referenced by menu code `EC` — replaced by inline prompt |
| `src/agents/gds-agent-tech-writer/documentation-standards.md` | NOT imported | Referenced as a persistent fact; Paige notices its absence at activation time and proceeds without it (Zero False Data — she does not fabricate standards) |

When these files are imported in a follow-up story, the menu items will switch from `prompt = "…"` to `prompt = "Read and follow the instructions in {skill-root}/<file>.md"` without persona changes.

## Adaptation Log

### Change 1 — Frontmatter slug rename

| Upstream | Our fork |
|---|---|
| `name: gds-agent-tech-writer` | `name: bmad-agent-game-tech-writer` |

**Rationale:** Two changes overlap here:

1. Our fork's skill-naming convention is `bmad-*` (enforced by SKILL-04 validator rule). The upstream BMGD module uses `gds-*` prefix.
2. The fork already has a `bmad-agent-tech-writer` (non-game Paige) — to avoid collision we insert `-game-` into the slug, yielding `bmad-agent-game-tech-writer`.

The H1 in `SKILL.md` is also disambiguated from "Paige — Technical Writer" to "Paige — Game Technical Writer" so the user can visually tell which Paige is speaking when both are installed.

### Change 2 — `disable-model-invocation: true` flag added

| Upstream | Our fork |
|---|---|
| (flag not present) | `disable-model-invocation: true` |

**Rationale:** Per Guardrail #10 of the originating story. Our fork's `bmad-agent-*` skills (Winston, Mary, Sally, John, Amelia, Paige non-game, Cloud Dragonborn) all carry this flag to prevent Claude from auto-invoking them as a tool — they should be invoked only on explicit user request. BMGD source does not have this flag because its activation model differs. We ADD this flag (not "preserve") to match the bmad-agent-* convention in this fork.

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

The upstream BMGD menu references 6 items (1 skill-based + 5 prompt-based pointing to `{skill-root}/*.md`):

| Upstream menu code | Upstream target | Status in our fork | Decision |
|---|---|---|---|
| `DP` | `skill = "gds-document-project"` | NOT present | UNBOUND (Option B in TD-6) — closest bmm equivalent is `bmad-document-project` but it is tuned for general codebase scanning, not game-specific brownfield analysis. Prompt-only menu item routes via `bmad-document-project` + domain stack. |
| `WD` | `prompt = "Read and follow…/write-document.md"` | Prompt file NOT imported | UNBOUND (Option B) — inline prompt replaces the file reference (file deferred to follow-up story). |
| `US` | `prompt = "Read and follow…/update-standards.md"` | Prompt file NOT imported | UNBOUND (Option B) — inline prompt replaces the file reference. |
| `MG` | `prompt = "Read and follow…/mermaid-gen.md"` | Prompt file NOT imported | UNBOUND (Option B) — inline prompt replaces the file reference. |
| `VD` | `prompt = "Read and follow…/validate-doc.md"` | Prompt file NOT imported | UNBOUND (Option B) — inline prompt replaces the file reference. |
| `EC` | `prompt = "Read and follow…/explain-concept.md"` | Prompt file NOT imported | UNBOUND (Option B) — inline prompt replaces the file reference. |

**Rationale:** Per Guardrail #4 of the originating story, the BMGD persona content (role / identity / communication_style / principles) is preserved verbatim from SHA `9dcd1253`. The menu, however, is configuration — not persona — and the upstream menu items target files not yet imported. Inline prompts capture the gist of each action so Paige remains usable; when the underlying `*.md` files are imported in a follow-up story, each `prompt = "…"` is swapped for the file reference without persona changes.

### Change 6 — Inline JIT-load of domain stack in Step 5

| Upstream | Our fork |
|---|---|
| (no domain stack concept) | Activation Step 5 includes an inline sub-step: after loading `workflow-context.md`, if `project_type` is set, apply `~/.claude/skills/bmad-shared/protocols/domain-stack-lookup.md` to JIT-load `bmad-shared/domains/{type}.md` |

**Rationale:** Per Task 16 / Guardrail #7 of the originating story, ALL agent SKILL.md activation sections include the JIT-load block. The block is added as a sub-step inside Step 5 (after `workflow-context.md` load — required ordering since `project_type` lives in that file). This is independent of the BMGD import (the upstream has no domain stack concept); the inline block exists for cross-fork uniformity.

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
curl -s "https://raw.githubusercontent.com/bmad-code-org/bmad-module-game-dev-studio/9dcd1253/src/agents/gds-agent-tech-writer/SKILL.md" -o /tmp/upstream-skill.md

# Diff the persona-defining body sections only (Overview, persona attributes — NOT activation steps which have local adaptations)
diff <(grep -A 10 "^## Overview" /tmp/upstream-skill.md) <(grep -A 10 "^## Overview" SKILL.md)
```

Expected: zero diff in the `## Overview` section (persona text preserved verbatim per Guardrail #4).
