# Project Guide

<!-- Template for bmad-knowledge-bootstrap step-07-generate-claude-local. Generates CLAUDE.local.md — a self-contained project guide auto-loaded by Claude Code every session. No BMAD jargon without explanation. Target: 150-250 lines. Sources: project.md / domain.md / api.md (consolidated 3-file layout). -->

## Project Quick Reference

<!-- ALWAYS INCLUDED. From workflow-context.md frontmatter. -->
<!-- Format as compact key-value block: name, app type, tracker type, forge, quality gate, package manager. -->

## Stack & Architecture

<!-- CONDITIONAL: Skip if CLAUDE.md already has a section with heading containing "architecture" or "structure". -->
<!-- From project.md§"Project Nature" + §"Architecture" + §"Tech Stack" + §"Source File Patterns" + §"Architecture Patterns". Keep it actionable — what Claude needs to make correct decisions. -->

## Code Conventions

<!-- CONDITIONAL: Skip if CLAUDE.md already has a section with heading containing "convention", "style", or "commit". -->
<!-- From project.md§"Conventions": commit format with allowed types as inline list, branch strategy (one line), key naming conventions (one line per category), import order (one line). Rules only, no explanations. -->

## Test Rules

<!-- CONDITIONAL: Skip if CLAUDE.md already has a section with heading containing "test". -->
<!-- From project.md§"Test Rules" + §"Validation Tooling": forbidden patterns as bullet list, test pyramid as compact table (type | framework | suffix | location), test commands. -->

## Domain Vocabulary

<!-- ALWAYS INCLUDED. From domain.md§"Ubiquitous Language". -->
<!-- Top 10-15 most important terms as: **Term** — one-line definition. No table format (too verbose). Only include terms that actively affect how Claude should write code or understand the project. -->

## Review Checklist

<!-- ALWAYS INCLUDED. From project.md§"Review Perspectives". -->
<!-- Condensed to 2-3 actionable items per perspective. Format as grouped bullet list. Include severity classification (one line per level). -->

## Investigation Guides

<!-- CONDITIONAL: Only if project.md§"Investigation Checklist" has real content (not just "No X detected"). -->
<!-- From project.md§"Investigation Checklist": condensed key investigation points per domain area. Format as grouped bullet list with file:line references where available. -->

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

**Source-of-truth principle**: knowledge files are derived views. Edit the **upstream source** (PRD, architecture, ADRs, specs, code) when possible — bootstrap/refresh will propagate. Edit knowledge files directly only for facts that have no upstream source.

| If your change introduces or modifies… | Update upstream source | Or knowledge file directly |
|----------------------------------------|------------------------|----------------------------|
| A language, framework, database, or major library | `architecture.md`§"Tech Stack" or new ADR | `.claude/workflow-knowledge/project.md` (§"Tech Stack") |
| A test framework, test-pyramid rule, or forbidden test pattern | `architecture.md`§"Test Strategy" or ADR | `.claude/workflow-knowledge/project.md` (§"Test Rules" / §"Validation Tooling") |
| A commit format, branch naming rule, or code-style convention | ADR or `architecture.md`§"Conventions" | `.claude/workflow-knowledge/project.md` (§"Conventions") |
| A domain entity, ubiquitous term, or bounded context | `prd.md`§"Domain" or specs | `.claude/workflow-knowledge/domain.md` |
| A CI workflow, deployed environment, alerting channel, or secret | `architecture.md`§"Infrastructure" or `architecture.md`§"Environments" | `.claude/workflow-knowledge/project.md` (§"Infrastructure" / §"Environments") |
| A public CLI command, module, or schema field | `architecture.md`§"API Design" or specs | `.claude/workflow-knowledge/api.md` |
| A tracker state, label, or issue template | `.claude/workflow-context.md` (frontmatter) — bootstrap regenerates project.md tracker section | `.claude/workflow-knowledge/project.md` (§"Tracker Patterns") if needed |
| A review perspective or severity rule | new ADR | `.claude/workflow-knowledge/project.md` (§"Review Perspectives") |
| An investigation checkpoint or debug pattern | new ADR | `.claude/workflow-knowledge/project.md` (§"Investigation Checklist") |
| The package manager, install/build/test/quality-gate command | `.claude/workflow-context.md` (frontmatter) | (no equivalent in knowledge — workflow-context.md is the source) |
| The worktree templates, branch template, or forge configuration | `.claude/workflow-context.md` (frontmatter) | — |
| The communication language, user name, or user skill level | `.claude/workflow-context.md` (frontmatter) | — |

### Update Protocol

1. **Identify** the affected file(s) via the table above.
2. **Read** the current file to understand structure and existing content.
3. **Edit in-place** — add, modify, or remove lines as needed. Preserve YAML frontmatter syntactic validity.
4. **Escalate if non-trivial**: if the change rewrites > 5 lines, alters the file's purpose, or spans > 2 knowledge files, STOP editing blindly and run `/bmad-knowledge-refresh` instead. That skill uses source-hash detection + per-file diff review — the correct tool for large or cross-cutting updates.
5. **Mention the update** in your session summary (e.g., `"Updated project.md tech-stack section to add Redis 7 as new dependency"`). Make the knowledge delta explicit for the user's review.

### When in Doubt

If you are unsure whether a change triggers a knowledge update, ASK the user before ending the session. Over-updating is cheap; silent drift is expensive — stale knowledge files are the #1 cause of workflow failures.

## Debugging & Investigation Standard

<!-- ALWAYS INCLUDED. Static content emitted verbatim by step-07. Cross-reference to bmad-shared/spec/evidence-based-debugging.md so the principle applies in ad-hoc debugging conversations, not only inside `/bmad-troubleshoot`. -->

**Code reading is never proof of a bug.** Reproducing the bug is. When investigating any error, unexpected behaviour, or "this should work but doesn't" question:

1. **Climb the Reproduction Hierarchy** (full rule: `~/.claude/skills/bmad-shared/spec/evidence-based-debugging.md`):
   - **Rung 1 (target)** — local reproduction via automated test running against real dependencies (real DB, real file system, no mocks of the suspected component). The test must FAIL at the baseline commit and PASS after the fix.
   - **Rung 2** — local manual reproduction (intermediate; promote to rung 1 before shipping).
   - **Rung 3** — captured production artifact (log + correlation ID, DB snapshot, stack trace, distributed trace).
   - **Rung 4** — live production observation (note the screenshot/copy made for durability).
   - **Rung 5** — user report only (acceptable as STARTING point; never as final proof).

2. **Rejected as proof:** code reading + reasoning, "it seems like…", "logically…", mocked tests of the suspected failing component, CI green, static analysis pass, "looks OK in staging".

3. **If rung 1 is unreachable**, document the exception class (E-1 to E-8 in the shared rule: prod-only state, race condition, infra-dependent, third-party state, one-shot event, heisenbug, time-dependent, hardware-specific) and climb to the highest reachable rung.

4. **Output** in any diagnosis: cite the rung achieved (`EVIDENCE_RUNG`) and, if relevant, the exception class. Make the proof explicit in your response — pre-fix command + output, post-fix command + output.

This rule applies in `/bmad-troubleshoot` (where it is mandatorily wired into step-03 and step-06) AND in any ad-hoc debugging conversation in this project.

## Workflow Adherence

<!-- ALWAYS INCLUDED. Static content emitted verbatim by step-07. Cross-reference to bmad-shared/core/workflow-adherence.md so the CHK pattern is known even outside formal workflow execution. -->

When executing a bmad-\* workflow (any `/bmad-*` slash command), the workflow's INITIALIZATION ends with a `CHK-INIT` Read Receipt — a structured block enumerating which files were actually loaded. **Emit it before running the first step.** If you cannot emit it truthfully, HALT and report the missing precondition. Full rule: `~/.claude/skills/bmad-shared/core/workflow-adherence.md`.

This rule exists because Claude Code's documented failure mode is to skim long workflow files and skip steps it judges "simple" — verified across community issues ([anthropics/claude-code#36997](https://github.com/anthropics/claude-code/issues/36997), [anthropics/claude-code#20024](https://github.com/anthropics/claude-code/issues/20024), [bmad-code-org/BMAD-METHOD#387](https://github.com/bmad-code-org/BMAD-METHOD/issues/387)). The receipt is a mechanical countermeasure — emitting it forces the read to actually happen.

## Deep Knowledge

<!-- ALWAYS INCLUDED. List only files that actually exist in {MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/. -->
<!-- Instruct Claude to read these files when deeper knowledge is needed. Format as: `filename` — one-line content description. This section is the bridge between the self-contained guide and the full knowledge base. -->
