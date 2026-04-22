# Fork Identity — What Makes Our Fork Different

This file is the source of truth for what distinguishes our fork from upstream BMAD-METHOD. Load this file BEFORE any sync operation. Every upstream change must be evaluated against these rules.

---

## Fork Philosophy

Our fork is a **developer platform for the BMAD methodology** — not just an application of it. Upstream provides the canonical product for practitioners; we provide an extended, deeply modular version with specialized domains (testing, validation, architecture review) and infrastructure for skill development.

**Key philosophical difference:** Upstream favors **monolithic narrative workflows** (single workflow.md files up to 1,479 lines). We favor **step-based decomposition** (workflow.md as orchestrator + `steps/step-NN-*.md` files). Both are valid approaches; when syncing, we preserve our decomposed architecture and integrate their content into our step structure.

## By the Numbers

| Metric | Our fork | Upstream |
|--------|----------|----------|
| Total skills | 73 | 43 |
| Skills with step-file architecture | 48 (66%) | 8 (19%) |
| Total src/ lines | ~108,000 | ~35,000 |
| Core-skills files | 197 | 32 |
| Unique skills (not in upstream) | 31 | 2 |
| Workflow.md files | 52 | 24 |
| Data/template files | 40+ more than upstream | — |

---

## Package Identity

| Field | Upstream | Our fork |
|-------|----------|----------|
| Package name | `bmad-method` | `@florian-trehaut/bmad-global` |
| npm scope | none | `@florian-trehaut` |
| Bin command | `bmad`, `bmad-method` | `bmad-global` |
| CLI entry point | `tools/installer/bmad-cli.js` | `tools/cli/bmad-cli.js` |
| Distribution tags | `latest` | `next` (dev), `latest` (stable) |
| Version tracking | — | `bmadUpstreamVersion` field in package.json |
| Remotes | origin = bmad-code-org | origin = florian-trehaut, upstream = bmad-code-org |

**Rule:** Never accept upstream changes to `package.json` name, bin, main entry point, publish config, or distribution metadata. Keep ours.

---

## Architectural Differences

### Step-file architecture (our convention)

| Aspect | Upstream | Our fork |
|--------|----------|----------|
| Step directory | Mixed: `steps/`, `domain-steps/`, `technical-steps/`, `steps-c/`, `steps-e/`, `steps-v/`, root-level step files | Always `steps/` |
| Step naming | Mixed patterns | `step-{NN}-{slug}.md` consistently |
| Workflow density | Dense monolithic workflows (e.g., retrospective = 1,479 lines, dev-story = 450 lines) | Lean orchestrator workflow.md (100-200 lines) + step files |

**Rule:** When upstream introduces new skills:
- If they use a non-standard step directory → rename to `steps/`
- If they have a monolithic workflow.md (>300 lines) → consider decomposing into steps (user decision)
- If they have root-level step files (outside any directory) → move into `steps/`

### Installer architecture

| Aspect | Upstream | Our fork |
|--------|----------|----------|
| Location | `tools/installer/` | `tools/cli/` |
| Design | IDE-aware (VSCode, JetBrains), platform-codes, manifest-driven | Global flat install, external module manager |
| Platform support | Multi-IDE | CLI-only |

**Rule:** Installer changes from upstream rarely apply. Evaluate case by case. Our `tools/cli/` is a completely different codebase.

### Shared rules layer (fork-only)

Upstream has no `bmad-shared` skill. Our fork has `src/core-skills/bmad-shared/` loaded by all workflows:

| Rule | Purpose |
|------|---------|
| `project-root-resolution.md` | Worktree-safe path resolution for `.claude/` files |
| `no-fallback-no-false-data.md` | Zero-fallback enforcement across all workflows |
| `worktree-lifecycle.md` | Optional worktrees + mandatory post-creation setup |
| `team-router.md` | Agent Teams capability detection |
| `spawn-protocol.md` | Teammate prompt template for Agent Teams |
| `task-contract-schema.md` | Universal task contract for teammates |
| `retrospective-step.md` | Conditional friction analysis at workflow end |
| `daily-planning-awareness.md` | Optional daily plan context loading |
| `agent-teams-config-schema.md` | Team configuration in workflow-context.md |

**Rule:** When upstream modifies workflow initialization or adds workflows, verify they don't conflict with our shared rule loading. Add shared rule references to any new upstream workflow that lacks them.

---

## Our Unique Skill Domains (31 skills not in upstream)

### Testing Excellence (TEA Framework) — 8 skills
`bmad-tea-framework`, `bmad-tea-atdd`, `bmad-tea-automate`, `bmad-tea-ci`, `bmad-tea-test-review`, `bmad-tea-trace`, `bmad-qa-automate`, `bmad-test-design`

Complete testing pipeline with Playwright fixtures, CI/CD templates, test framework selection, traceability matrices. 35+ knowledge files.

### Architecture Decision Records — 2 skills
`bmad-create-adr` (7 steps), `bmad-adr-review` (8 steps)

Full ADR lifecycle with anti-pattern detection (Fairy Tale, Sprint, Tunnel Vision, Retroactive Fiction), git-based decision-maker discovery, mermaid diagrams, MADR 4.0 + Nygard templates.

### Validation & Proof — 2 skills
`bmad-validation-desktop` (5 steps), `bmad-validation-metier` (4 steps)

Desktop and domain-specific validation with VM classification, proof standards matrices.

### Knowledge & Onboarding — 3 skills
`bmad-knowledge-bootstrap` (8 steps + 10 templates), `bmad-spike` (8 steps), `bmad-troubleshoot` (5 steps)

Project detection (stack, tracker, forge, communication platform), knowledge file generation, spike investigation framework.

### Skill Development Infrastructure — 9 skills
`bmad-agent-builder`, `bmad-builder-setup`, `bmad-create-module`, `bmad-create-skill`, `bmad-edit-skill`, `bmad-validate-skill`, `bmad-workflow-builder`, `bmad-shared`, `bmad-knowledge-bootstrap`

Meta-tools for creating, editing, validating skills and modules. Not in upstream because upstream doesn't need self-development tools.

### Workflow Enhancements — 7 cross-cutting features
These are not separate skills but enhancements woven into existing workflows:
1. **ADR awareness** — All workflows check for ADR implications with HALT + menu
2. **Story point estimation** — create-story auto-estimates Fibonacci points
3. **Worktree lifecycle** — Shared rule for optional worktrees + mandatory post-creation setup
4. **Agent Teams integration** — team-router, spawn-protocol, task-contract-schema
5. **Retrospective step** — Conditional friction analysis at workflow end
6. **Daily planning awareness** — Optional daily plan context loading
7. **Decision-maker discovery** — ADR workflows use git log analysis for stakeholders

**Rule:** When upstream modifies files we enhanced, keep our enhancements and integrate only their content changes (bugfixes, new features, improved prompts).

---

## Upstream Features We Don't Have

| Feature | Upstream skill | Assessment |
|---------|---------------|------------|
| PRFAQ | `bmad-prfaq` | Press release + FAQ generation. Marketing/strategy tool. Evaluate on sync if relevant. |
| Multi-IDE installer | `tools/installer/` | Platform-codes for VSCode, JetBrains, etc. We use global flat install — not applicable. |
| Plugin marketplace | `.claude-plugin/marketplace.json` | Plugin registry metadata. Evaluate if we want to participate. |

---

## Project-Level Files (fork-only, NEVER overwrite)

- `.claude/workflow-context.md` — Project-specific workflow configuration
- `.claude/workflow-knowledge/*.md` — Generated knowledge files (10 files)
- `.claude/skills/bmad-upstream-sync/` — This sync skill itself
- `.claude/skills/changelog/` — Changelog generation skill
- `.claude/settings.local.json` — Local settings
- `_bmad-output/` — Local artifacts
- `AGENTS.md` — Agent configuration

**Rule:** If upstream introduces new files in `.claude/`, evaluate whether to adopt. Never blindly merge.

---

## Content We Always Accept From Upstream

1. **Bugfixes** — Always integrate, even in files we modified. Apply to our version.
2. **New skills** — Adopt, but adapt to our step-file naming and add shared rule references
3. **Template improvements** — Better prompts, better instructions, improved questioning
4. **Validation rule updates** — `validate-skills.js`, `validate-file-refs.js`
5. **Docs updates** — Accept unless they conflict with fork-specific docs
6. **CI improvements** — Evaluate, usually accept
7. **Data file additions** — CSV, detection patterns, checklists — always valuable

## Content We Always Keep Ours

1. **Package identity** — name, version, bin, publish config
2. **CHANGELOG.md** — Our changelog, not theirs
3. **README.md** — Our readme with fork-specific instructions
4. **Installer code** — `tools/cli/` is our codebase, not theirs
5. **Enhanced workflow steps** — Our ADR checks, estimation, retrospective, worktree lifecycle
6. **Shared rules** — Our additions to bmad-shared/
7. **CLAUDE.md** — Our project-specific instructions
8. **Test files** — Our test suite reflects our installer architecture
9. **Extended TOML customization** — We extend upstream's TOML customization to 23 fork-specific workflow skills beyond upstream's 17 (see "TOML customization extension" below). These `customize.toml` files in fork-only skill directories must be preserved across syncs.

---

## TOML customization extension (fork-only)

Our fork extends upstream's TOML customization system to **all workflow-type skills**, not just the 17 upstream covered. Total coverage: **46/71 skills** (6 agents + 40 workflow skills).

**Fork-only customize.toml files** (23 skills beyond upstream's coverage):

| Category | Skills |
|---|---|
| Workflow-conversational (9) | bmad-create-adr, bmad-adr-review, bmad-spike, bmad-nfr-assess, bmad-troubleshoot, bmad-daily-planning, bmad-knowledge-bootstrap, bmad-knowledge-refresh, bmad-brainstorming |
| TEA testing framework (8) | bmad-tea-framework, bmad-tea-atdd, bmad-tea-automate, bmad-tea-ci, bmad-tea-test-review, bmad-tea-trace, bmad-qa-automate, bmad-test-design |
| Validation (3) | bmad-validation-desktop, bmad-validation-frontend, bmad-validation-metier |
| Agent orchestration (2) | bmad-party-mode, bmad-advanced-elicitation |
| Fix-up (1) | bmad-create-story (upstream had it at `4-implementation/`; we renamed to `2-plan-workflows/`) |

**Exclusions aligned with upstream** (no customize.toml in either tree):
- Developer-execution (6): bmad-dev-story, bmad-code-review, bmad-review-story, bmad-checkpoint-preview, bmad-quick-dev, bmad-sprint-planning, bmad-sprint-status
- Meta-tools (7): bmad-create-skill, bmad-edit-skill, bmad-validate-skill, bmad-agent-builder, bmad-workflow-builder, bmad-create-module, bmad-builder-setup
- Utility-batch (4): bmad-distillator, bmad-index-docs, bmad-shard-doc, bmad-customize
- Sub-skills programmatic (3): bmad-review-adversarial-general, bmad-review-edge-case-hunter, bmad-review-regression-risk
- Editorial (2): bmad-editorial-review-prose, bmad-editorial-review-structure
- Shared infrastructure (2): bmad-shared, bmad-help

**Rule for future upstream syncs**:
- If upstream adds `customize.toml` to a skill we already have → accept upstream's version, ours may need to be regenerated from the new upstream template
- If upstream removes `customize.toml` from a skill → keep ours (we decided it's needed)
- If upstream extends `customize.toml` to one of our excluded skills → **re-evaluate our exclusion** case-by-case via the skill-classification in `src/scripts/generate_customization.py` (BATCHES dict)
- Generator script `src/scripts/generate_customization.py` encodes our classification and can regenerate all 23 fork-only files idempotently

---

## Conflict Resolution Priority

When the same file is modified by both sides:

1. **Our structure wins** — File organization, step directory naming, workflow decomposition
2. **Their content additions are integrated** — New features, bugfixes, improved prompts
3. **Our enhancements are preserved** — ADR checks, estimation, shared rule references, worktree lifecycle
4. **Neither side's deletions are auto-accepted** — Present to user for decision
5. **Monolithic-to-step conflicts** — If they expanded a monolithic workflow we decomposed into steps, integrate their new content into the relevant step file (not into workflow.md)
