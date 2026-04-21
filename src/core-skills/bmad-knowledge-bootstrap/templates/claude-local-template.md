# Project Guide

<!-- Template for bmad-knowledge-bootstrap step 09. Generates CLAUDE.local.md — a self-contained project guide auto-loaded by Claude Code every session. No BMAD jargon without explanation. Target: 150-250 lines. -->

## Project Quick Reference

<!-- ALWAYS INCLUDED. From workflow-context.md frontmatter. -->
<!-- Format as compact key-value block: name, app type, tracker type, forge, quality gate, package manager. -->

## Stack & Architecture

<!-- CONDITIONAL: Skip if CLAUDE.md already has a section with heading containing "architecture" or "structure". -->
<!-- From stack.md: project nature (1 paragraph), architecture patterns table (scope | pattern | key rules), current stack table (top 6 entries), source file patterns table. Keep it actionable — what Claude needs to make correct decisions. -->

## Code Conventions

<!-- CONDITIONAL: Skip if CLAUDE.md already has a section with heading containing "convention", "style", or "commit". -->
<!-- From conventions.md: commit format with allowed types as inline list, branch strategy (one line), key naming conventions (one line per category), import order (one line). Rules only, no explanations. -->

## Test Rules

<!-- CONDITIONAL: Skip if CLAUDE.md already has a section with heading containing "test". -->
<!-- From stack.md test section: forbidden patterns as bullet list, test pyramid as compact table (type | framework | suffix | location), test commands. -->

## Domain Vocabulary

<!-- ALWAYS INCLUDED. From domain-glossary.md. -->
<!-- Top 10-15 most important terms as: **Term** — one-line definition. No table format (too verbose). Only include terms that actively affect how Claude should write code or understand the project. -->

## Review Checklist

<!-- ALWAYS INCLUDED. From review-perspectives.md. -->
<!-- Condensed to 2-3 actionable items per perspective. Format as grouped bullet list. Include severity classification (one line per level). -->

## Investigation Guides

<!-- CONDITIONAL: Only if investigation-checklist.md exists and has real content (not just "No X detected"). -->
<!-- From investigation-checklist.md: condensed key investigation points per domain area. Format as grouped bullet list with file:line references where available. -->

## Personal Preferences

<!-- ALWAYS INCLUDED. From workflow-context.md frontmatter. -->
<!-- Format: communication_language, document_output_language, user_name, user_skill_level. -->

## Workflow Integration

<!-- ALWAYS INCLUDED. From workflow-context.md frontmatter. -->
<!-- Worktree templates (if worktree_enabled): formatted as name: command pattern. Branch template. Forge PR commands (create, list). Tracker type + state machine (states inline). Quality gate command. -->

## Available Skills

<!-- ALWAYS INCLUDED. Scan ~/.claude/skills/bmad-*/SKILL.md at generation time. -->
<!-- List as: `/skill-name` — one-line description (from SKILL.md frontmatter). Exclude utility skills (bmad-shared, bmad-help). Group by purpose if >10 skills. -->

## Knowledge Maintenance Policy

<!-- ALWAYS INCLUDED. Static content emitted verbatim by step-09. Tells Claude to keep the knowledge base in sync with every session's changes. -->

**This project's knowledge files and workflow context are alive — keep them in sync with the code.**

When a change made during this session affects the project's ground truth (stack, conventions, domain, infra, API surface, tracker, review rules, investigation patterns, workflow configuration), update the corresponding knowledge file **before ending the session**. Do not defer. Do not leave `TODO: update knowledge` comments.

### Triggers → Updates

| If your change introduces or modifies… | Update this file |
|----------------------------------------|------------------|
| A language, framework, database, or major library | `.claude/workflow-knowledge/stack.md` |
| A test framework, test-pyramid rule, or forbidden test pattern | `.claude/workflow-knowledge/stack.md` (Test section) |
| A commit format, branch naming rule, or code-style convention | `.claude/workflow-knowledge/conventions.md` |
| A domain entity, ubiquitous term, or bounded context | `.claude/workflow-knowledge/domain-glossary.md` |
| A CI workflow, deployed environment, alerting channel, or secret | `.claude/workflow-knowledge/infrastructure.md` |
| A public CLI command, module, or schema field | `.claude/workflow-knowledge/api-surface.md` |
| A tracker state, label, or issue template | `.claude/workflow-knowledge/tracker.md` AND `.claude/workflow-context.md` |
| A review perspective or severity rule | `.claude/workflow-knowledge/review-perspectives.md` |
| An investigation checkpoint or debug pattern | `.claude/workflow-knowledge/investigation-checklist.md` |
| The package manager, install/build/test/quality-gate command | `.claude/workflow-context.md` (frontmatter) |
| The worktree templates, branch template, or forge configuration | `.claude/workflow-context.md` (frontmatter) |
| The communication language, user name, or user skill level | `.claude/workflow-context.md` (frontmatter) |

### Update Protocol

1. **Identify** the affected file(s) via the table above.
2. **Read** the current file to understand structure and existing content.
3. **Edit in-place** — add, modify, or remove lines as needed. Preserve YAML frontmatter syntactic validity.
4. **Escalate if non-trivial**: if the change rewrites > 5 lines, alters the file's purpose, or spans > 2 knowledge files, STOP editing blindly and run `/bmad-knowledge-refresh` instead. That skill uses source-hash detection + per-file diff review — the correct tool for large or cross-cutting updates.
5. **Mention the update** in your session summary (e.g., `"Updated stack.md to add Redis 7 as new dependency"`). Make the knowledge delta explicit for the user's review.

### When in Doubt

If you are unsure whether a change triggers a knowledge update, ASK the user before ending the session. Over-updating is cheap; silent drift is expensive — stale knowledge files are the #1 cause of workflow failures.

## Deep Knowledge

<!-- ALWAYS INCLUDED. List only files that actually exist in {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/. -->
<!-- Instruct Claude to read these files when deeper knowledge is needed. Format as: `filename` — one-line content description. This section is the bridge between the self-contained guide and the full knowledge base. -->
