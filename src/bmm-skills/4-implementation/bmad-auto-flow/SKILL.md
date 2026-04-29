---
name: bmad-auto-flow
description: Cross-workflow lifecycle orchestrator — automates the full BMAD story flow (spec → review → dev → code-review → validation) via Agent Teams. The orchestrator runs the spec phase inline (interactive with the user) and delegates the other 4 phases to isolated teammates for impartial review and parallelism. Question routing teammate→lead→user is batched; phase failures present [R]etry / [F]ix / [A]bandon. Falls back to sequential inline execution when Agent Teams is unavailable. Requires `agent_teams.enabled: true` in workflow-context.md and CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1. Use when 'auto-flow', 'auto flow', 'orchestrate full lifecycle', 'spec to validation', 'full BMAD cycle', 'cross-workflow' is mentioned.
disable-model-invocation: true
---

Read FULLY and follow `./workflow.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
