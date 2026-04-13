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

## Deep Knowledge

<!-- ALWAYS INCLUDED. List only files that actually exist in {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/. -->
<!-- Instruct Claude to read these files when deeper knowledge is needed. Format as: `filename` — one-line content description. This section is the bridge between the self-contained guide and the full knowledge base. -->
