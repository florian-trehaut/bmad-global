---
name: bmad-review-regression-risk
description: "Detects the #1 regression cause in rebased branches: silent discard of target-branch changes during conflict resolution. Runs two complementary phases — pre-rebase overlap detection and post-rebase suspicious-removal detection — classifies HIGH/MEDIUM/LOW risk per file, and cross-references each removal against tracker-issue scope. Produces REGRESSION_RISK_LEVEL, OVERLAPPING_FILES, and PHASE2_SUSPICIOUS_REMOVALS outputs. Invoked as a persona-skill by review workflows (bmad-code-review, bmad-review-story, bmad-adr-review) via Agent() prompt reference. Use when 'regression risk', 'stale rebase', 'post-rebase detection' is mentioned."
disable-model-invocation: true
---

Follow the instructions in ./workflow.md.
