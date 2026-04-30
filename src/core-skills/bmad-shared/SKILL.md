---
name: bmad-shared
description: "Shared rules loaded by all bmad-* workflow skills. Contains zero-fallback/zero-false-data rules and common workflow patterns. Use when loading shared rules during workflow initialization — not invoked directly by users."
---

Shared rules and protocols loaded by all bmad-* workflow skills. Contains zero-fallback rules, spawn protocols, team routing, and common workflow patterns.

## Structure

```
bmad-shared/
├── SKILL.md                          (this file — entrypoint + lookup table)
├── core/                             (auto-loaded universally — every workflow Globs core/*.md at INIT)
│   ├── no-fallback-no-false-data.md
│   ├── workflow-adherence.md
│   ├── knowledge-loading.md
│   ├── retrospective-step.md
│   └── project-root-resolution.md
├── spec/                             (JIT — spec-producing/consuming workflows)
│   ├── spec-completeness-rule.md
│   ├── ac-format-rule.md
│   ├── boundaries-rule.md
│   └── evidence-based-debugging.md
├── teams/                            (JIT — team-aware / orchestrator-spawned workflows)
│   ├── team-router.md
│   ├── teammate-mode-routing.md
│   ├── orchestrator-registry.md
│   ├── task-contract-schema.md
│   ├── spawn-protocol.md
│   └── agent-teams-config-schema.md
├── validation/                       (JIT — bmad-validation-* skills only)
│   └── validation-protocol.md        (merged: intake + verdict + proof-principles)
├── lifecycle/                        (JIT — workflows performing worktree setup)
│   └── worktree-lifecycle.md
├── schema/                           (JIT — knowledge-aware skills only)
│   └── knowledge-schema.md
├── protocols/                        (JIT — capability protocols, unchanged)
│   ├── tracker-crud.md
│   ├── tech-stack-lookup.md
│   ├── environments-lookup.md
│   ├── validation-tooling-lookup.md
│   ├── concurrency-review.md
│   ├── null-safety-review.md
│   └── spec-bifurcation.md
├── data/                             (JIT — reference data, unchanged)
└── stacks/                           (JIT — language-keyed rules, unchanged)
```

## Loading Patterns

### Auto-loaded — every workflow

Every bmad-* workflow Globs `~/.claude/skills/bmad-shared/core/*.md` at INITIALIZATION and Reads each file. The 5 core files are universal — `no-fallback-no-false-data.md`, `workflow-adherence.md`, `knowledge-loading.md`, `retrospective-step.md`, `project-root-resolution.md`.

### JIT — per workflow type

Workflows load additional subdirectories based on what they need. Reference the matrix below for the canonical mapping.

| Workflow type | core/ | spec/ | teams/ | validation/ | lifecycle/ | schema/ |
|---------------|:-----:|:-----:|:------:|:-----------:|:----------:|:-------:|
| `bmad-create-story`, `bmad-quick-spec` | YES | YES | optional | — | conditional | conditional |
| `bmad-review-story` | YES | YES | optional | — | conditional | — |
| `bmad-dev-story` | YES | YES | optional | — | YES | conditional |
| `bmad-code-review` | YES | YES | optional | — | YES | — |
| `bmad-validation-*` | YES | — | — | YES | conditional | — |
| `bmad-troubleshoot` | YES | partial (evidence-based-debugging) | — | — | conditional | — |
| `bmad-knowledge-*` | YES | — | — | — | — | YES |
| `bmad-auto-flow` (orchestrator) | YES | — | YES | — | YES | conditional |
| `bmad-help`, `bmad-status`, `bmad-daily-planning` | YES | — | — | — | — | — |

## Rule Type Lookup Table

When you need a specific shared rule, consult this table to find the canonical path.

| Need | Path |
|------|------|
| Zero fallback / no false data on business fields | `core/no-fallback-no-false-data.md` |
| CHK-INIT, CHK-STEP-NN-ENTRY/EXIT, NO-SKIP CLAUSE, anti-skim transitions | `core/workflow-adherence.md` |
| Knowledge file loading protocol (project.md / domain.md / api.md) | `core/knowledge-loading.md` |
| Retrospective step at end of workflow | `core/retrospective-step.md` |
| MAIN_PROJECT_ROOT resolution from worktrees | `core/project-root-resolution.md` |
| Story-spec v2 / v3 mandatory sections | `spec/spec-completeness-rule.md` |
| BACs in G/W/T, TACs in EARS (5 patterns) | `spec/ac-format-rule.md` |
| Boundaries Triple (Always Do / Ask First / Never Do) | `spec/boundaries-rule.md` |
| Reproduction Hierarchy, exception classes E-1..E-8 for debugging | `spec/evidence-based-debugging.md` |
| Detect Agent Teams capability, set TEAM_MODE | `teams/team-router.md` |
| Detect TEAMMATE_MODE, reroute AskUserQuestion + tracker writes | `teams/teammate-mode-routing.md` |
| Authorized orchestrator skills closed list | `teams/orchestrator-registry.md` |
| Task contract YAML schema for teammate spawn | `teams/task-contract-schema.md` |
| Spawn prompt template (5 sections) | `teams/spawn-protocol.md` |
| `agent_teams:` block schema in workflow-context.md | `teams/agent-teams-config-schema.md` |
| Validation intake (issue discovery, VM/DoD parsing) | `validation/validation-protocol.md#intake` |
| Validation verdict compilation, status update | `validation/validation-protocol.md#verdict` |
| Universal validation proof principles | `validation/validation-protocol.md#proof-principles` |
| Worktree lifecycle (Branch A/B/C/D, post-creation setup, cleanup) | `lifecycle/worktree-lifecycle.md` |
| Knowledge schema (sections, anchors, protocols, schema_version) | `schema/knowledge-schema.md` |
| Tracker CRUD recipes (file / Linear / GitHub / GitLab / Jira) | `protocols/tracker-crud.md` |
| Tech stack / language / framework lookup | `protocols/tech-stack-lookup.md` |
| Environments / staging / production URLs | `protocols/environments-lookup.md` |
| Validation tooling (lint / format / test runner) | `protocols/validation-tooling-lookup.md` |
| Concurrency review per stack | `protocols/concurrency-review.md` |
| Null-safety review per stack | `protocols/null-safety-review.md` |
| Spec bifurcation operations (compose, drift, sync, handoff) | `protocols/spec-bifurcation.md` |
| Per-language stack rules | `stacks/{language}.md` |
