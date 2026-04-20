---
name: bmad-code-review
description: "Adversarial, stack-agnostic code review workflow. Discovers reviewable MRs from forge + tracker, classifies (colleague/self/draft), sets up review worktree, detects regression risk, dispatches 5 parallel Agent() calls (3 review-workers + 2 asymmetric security reviewers S1 attacker / S2 defender) then a dedicated judge-triage subagent that deduplicates, applies voting consensus, classifies action per finding, and emits a consolidated verdict. Posts findings as forge DiffNotes or tracker comments, approves or blocks. Works on any stack (TypeScript, Python, Go, Rust, Java, Ruby) via stack-grep-bank data files. No experimental flags required. Use when 'code review', 'review MR', 'review la MR', 'revue de code', 'reviewer' is mentioned."
disable-model-invocation: true
---

Follow the instructions in ./workflow.md.
