---
# ============================================================
# WORKFLOW CONTEXT — BMAD-METHOD
# ============================================================
# This file is the project-specific contract loaded by all
# global bmad-* workflow skills (~/.claude/skills/bmad-*/).
# Format: YAML frontmatter + markdown body.
# ============================================================

# --- Project identity ---
project_name: BMAD-METHOD
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
forge_mr_create: "gh pr create --repo florian-trehaut/bmad-global"
forge_mr_list: "gh pr list --repo florian-trehaut/bmad-global"
forge_mr_approve: "gh pr review --approve --repo florian-trehaut/bmad-global"
forge_api_base: "gh api"
# Git remotes: origin=user's fork, upstream=bmad-code-org/BMAD-METHOD
fork_remote: origin
upstream_remote: upstream

# --- Worktree naming ---
worktree_prefix: bmad-method
worktree_templates:
  dev: "../bmad-method-{issue_number}-{short_description}"
  review: "../bmad-method-review-{mr_iid}"
  spec_review: "../bmad-method-review-spec-{issue_number}"
  validation: "../bmad-method-validation-{issue_number}"
  quick_spec: "../bmad-method-spec-{slug}"
  spike: "../bmad-method-spike-{slug}"
branch_template: "feat/{issue_number}-{short_description}"

# --- Application type ---
app_type: "framework"

# --- Build tooling & commands ---
package_manager: npm
install_command: "npm install"
build_command: ""
test_command: "npm test"
lint_command: "npm run lint"
format_command: "npm run format:check"
format_fix_command: "npm run format:fix"
typecheck_command: ""
quality_gate: "npm run quality"

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

# BMAD-METHOD Workflow Context

## Knowledge Files

The following knowledge files are available in `.claude/workflow-knowledge/` and should be loaded JIT:

| File | Content | Loaded by |
|------|---------|-----------|
| `tracker.md` | File-based tracker patterns, sprint-status.yaml conventions, story file naming | All tracker workflows |
| `stack.md` | Tech stack (Markdown/YAML skills + JS tooling), forbidden patterns, test rules | dev-story, code-review, review-story, create-story |
| `infrastructure.md` | GitHub Actions CI/CD, npm publish distribution, no cloud infra | dev-story, code-review, review-story |
| `environment-config.md` | N/A — no deployed environments (distributed as npm package) | — |
| `investigation-checklist.md` | Domain-specific investigation guides for skill system, CLI, docs, validators | review-story |
| `review-perspectives.md` | Code review perspectives, severity rules | code-review |
| `conventions.md` | Commit format, branch strategy, code style, skill naming rules | dev-story, code-review |
| `domain-glossary.md` | BMAD ubiquitous language: skills, modules, phases, workflows, steps | review-story, create-story |
| `api-surface.md` | CLI commands, module.yaml schema, skill validation rules | review-story, dev-story |

## Project Nature

**BMAD-METHOD** is a skill distribution framework for AI-driven agile development. It is NOT a typical application — it is a collection of:

- **Skills** (~50+): Markdown/YAML workflow definitions (SKILL.md + workflow.md + steps/ + data/ + templates/) executed by LLMs
- **Modules**: Groups of skills with configuration (module.yaml)
- **CLI tool**: Node.js installer that deploys skills globally via `npx @florian-trehaut/bmad-global install`
- **Docs site**: Astro Starlight website with llms.txt generation

The core content (skills, workflows, steps) is text-based Markdown/YAML. The JS tooling handles installation, validation, and distribution.

## Project-Specific Skills

- `bmad-upstream-sync` — Synchronize fork with upstream BMAD-METHOD repository

## Reference Code

- **Good patterns**: `src/bmm-skills/` (phase-organized skill structure), `src/core-skills/` (utility skills)
- **NEVER copy from**: N/A

## Alerting

No dedicated alerting system. Distribution notifications via Discord webhook (GitHub Actions).
