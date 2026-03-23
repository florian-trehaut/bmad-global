---
# ============================================================
# WORKFLOW CONTEXT — bmad-global
# ============================================================
# This file is the project-specific contract loaded by all
# global bmad-* workflow skills (~/.claude/skills/bmad-*/).
# It provides tracker IDs, forge config, stack info, and
# pointers to knowledge files that workflows load JIT.
#
# Format: YAML frontmatter + markdown body.
# Workflows read this file at initialization and extract
# values from the frontmatter for dynamic behavior.
# ============================================================

# --- Project identity ---
project_name: bmad-global
issue_prefix: BMAD

# --- Issue tracker ---
tracker: file
tracker_file: "_bmad-output/implementation-artifacts/sprint-status.yaml"
tracker_story_location: "_bmad-output/implementation-artifacts/"
tracker_epics_file: "_bmad-output/planning-artifacts/epics.md"
tracker_states:
  backlog: "backlog"
  ready_for_dev: "ready-for-dev"
  in_progress: "in-progress"
  review: "review"
  done: "done"

# --- Source control forge ---
forge: github
forge_project_path: "florian-trehaut/bmad-global"
forge_cli: gh
forge_mr_create: "gh pr create"
forge_mr_list: "gh pr list"
forge_mr_approve: "gh pr review --approve"
forge_api_base: "gh api"

# --- Worktree naming ---
worktree_prefix: bmad-global
worktree_templates:
  dev: "../bmad-global-{issue_number}-{short_description}"
  review: "../bmad-global-review-{mr_iid}"
  spec_review: "../bmad-global-review-spec-{issue_number}"
  validation: "../bmad-global-validation-{issue_number}"
  quick_spec: "../bmad-global-spec-{slug}"
branch_template: "feat/{issue_number}-{short_description}"

# --- Build tooling & commands ---
# Current: JavaScript/Node.js (being migrated to Rust)
# Target: Rust + Cargo
package_manager: cargo
install_command: "cargo build"
build_command: "cargo build --release"
test_command: "cargo test"
lint_command: "cargo clippy -- -D warnings"
format_command: "cargo fmt --check"
format_fix_command: "cargo fmt"
typecheck_command: ""
quality_gate: "cargo fmt --check && cargo clippy -- -D warnings && cargo test"

# --- Communication ---
communication_language: Français
document_output_language: English
user_name: Florian TREHAUT
user_skill_level: expert

# --- Labels ---
labels:
  spec_reviewed: "spec-reviewed"
  client_prefix: ""
---

# bmad-global Workflow Context

## Knowledge Files

The following knowledge files are available in `.claude/workflow-knowledge/` and should be loaded JIT (just-in-time) when a workflow step needs them:

| File | Content | Loaded by |
|------|---------|-----------|
| `tracker.md` | File-based tracker patterns, sprint-status.yaml conventions, story file naming | All workflows that interact with the tracker |
| `stack.md` | Tech stack (Rust CLI + Markdown/YAML skill content), forbidden patterns, test rules | dev-story, code-review, review-story, quick-spec |
| `infrastructure.md` | GitHub Actions CI/CD, cargo publish distribution, no cloud infra | dev-story, code-review, review-story |
| `environment-config.md` | N/A — no deployed environments (distributed as cargo package) | — |
| `investigation-checklist.md` | Domain-specific investigation guides | review-story |
| `review-perspectives.md` | Code review perspectives, checklists, severity rules | code-review |

## Project Nature

**bmad-global** is a fork of BMAD-METHOD, a skill distribution framework for AI-driven agile development. It is NOT a typical application — it is a collection of:

- **Skills** (~50+): Markdown/YAML workflow definitions (SKILL.md + workflow.md + steps/ + data/ + templates/) executed by LLMs
- **Modules**: Groups of skills with configuration (module.yaml)
- **CLI tool**: Installer that deploys skills globally via `cargo install bmad-global`
- **Docs site**: Astro Starlight website with llms.txt generation

The core content (skills, workflows, steps) is text-based Markdown/YAML. The Rust tooling handles installation, validation, and distribution.

## Migration Context

This project is being migrated from JavaScript (Node.js/npm) to Rust (Cargo):
- CLI: Commander/Clack → clap (or similar)
- Distribution: npm publish → cargo install / cargo publish
- Validators: Node.js scripts → Rust
- Pre-commit: Husky/lint-staged → cargo fmt + clippy
- The Markdown/YAML skill content remains unchanged

## Project-Specific Skills

None yet — add project-specific skills as needed.

## Reference Code

- **Good patterns**: src/bmm-skills/ (phase-organized skill structure), src/core-skills/ (utility skills)
- **NEVER copy from**: N/A

## Alerting

No dedicated alerting system. Distribution notifications via Discord webhook (GitHub Actions).
