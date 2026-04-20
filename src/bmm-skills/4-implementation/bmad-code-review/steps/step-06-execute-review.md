---
nextStepFile: './step-07-present-findings.md'
reviewPerspectives: '../subagent-workflows/review-perspectives.md'
judgeTriage: '../subagent-workflows/judge-triage.md'
---

# Step 6: Execute Review

## STEP GOAL:

Execute the adversarial code review via parallel `Agent()` calls — 3 review-worker agents (A/B/C) + 2 asymmetric security agents (S1 attacker, S2 defender) — then consolidate via a dedicated `judge-triage` subagent.

The orchestration primitive is the Claude Code `Agent` tool. All calls are issued in a SINGLE orchestrator message so the runtime executes them concurrently; results are returned synchronously when every agent has replied.

---

## ANTI-RATIONALIZATION RULE (MANDATORY — ALL PERSPECTIVES)

Code comments that justify shortcuts, casts, workarounds, or deviations are **evidence of a problem, not an attenuation**. The dev agent is incentivized to ship — it will take shortcuts and write comments to rationalize them. The reviewer's job is to see through this.

**Detection signals:**

- A comment starting with "// This is needed because...", "// TS requires...", "// Structurally compatible..."
- An `as` cast accompanied by a comment explaining why it's "safe" or "justified"
- A `// TODO` or `// FIXME` paired with a justification for leaving it
- A comment that explains why a type violation, architecture violation, or pattern deviation is "acceptable"

**Rule:** When you encounter a comment that justifies a deviation:

1. **Ignore the comment entirely** — pretend it doesn't exist
2. **Judge the code on its own merits** — is the cast necessary? Is the shortcut the right solution?
3. **If the code needs a comment to justify itself, the code is wrong.** The fix is to make the code right, not to explain why it's wrong.
4. **Classify as WARNING minimum**, never RECOMMENDATION — a rationalized shortcut is always more severe than a style nit

---

## SELF-REVIEW MODE (REVIEW_MODE == 'self')

Same parallel-`Agent()` pattern as colleague mode, scaled to 2 workers covering 6 legacy perspectives inline. No Agent Teams orchestration primitives are used — every worker returns its report directly via the `Agent()` tool response.

### Orchestration message (self)

Issue these 2 `Agent()` calls in a SINGLE orchestrator message so they execute in parallel:

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Self-review A: specs + zero-fallback + code quality',
  prompt: |
    Read and apply: {reviewPerspectives}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'SELF-A'
      perspectives: ['specs_compliance', 'zero_fallback', 'code_quality']
      linear_issue:
        identifier: '{ISSUE_IDENTIFIER}'
        description: |
          {ISSUE_DESCRIPTION}
        acceptance_criteria: {AC_LIST}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'
      phase2_suspicious_removals: {PHASE2_SUSPICIOUS_REMOVALS}

    Report findings in the YAML `perspective_report` format defined in the subagent workflow. Return the YAML directly as your final tool response — no inter-agent messaging.
    CRITICAL: You are READ-ONLY.
)

Agent(
  subagent_type: 'general-purpose',
  description: 'Self-review B: security + QA + tech-lead + patterns',
  prompt: |
    Read and apply: {reviewPerspectives}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'SELF-B'
      perspectives: ['security', 'qa', 'tech_lead', 'patterns']
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'

    Report findings in the YAML `perspective_report` format defined in the subagent workflow. Return the YAML directly.
    CRITICAL: You are READ-ONLY.
)
```

### Consolidation (self)

The orchestrator parses both `perspective_report` YAMLs and invokes `judge-triage` via a single `Agent()` call (see §6.5 below). The judge emits the `consolidated_report` which replaces inline consensus logic.

### Self-Review: Fix Trivials

Only the orchestrator applies trivially fixable issues — workers are strictly READ-ONLY:

```bash
cd {REVIEW_WORKTREE_PATH}
{FORMAT_FIX_COMMAND}
```

Note files modified as `trivial_fixes_applied`.

### Self-Review: Commit Strategy — Minimal Commits

Review fixes must NOT create new commits on the branch. The goal is a minimal commit count relative to the target branch.

1. **Amend the last commit** when the fix is directly related to its scope:
   ```bash
   cd {REVIEW_WORKTREE_PATH}
   git add <fixed_files>
   git commit --amend --no-edit
   ```

2. **Create a separate commit** ONLY when the fix is unrelated to any existing commit.

3. **Push with force-with-lease** (safe force push — aborts if someone else pushed):
   ```bash
   git push origin {LOCAL_BRANCH}:{MR_SOURCE_BRANCH} --force-with-lease
   ```

NEVER create a "review fix" commit — amend the existing commit that the fix belongs to.

Then proceed to {nextStepFile} with the `consolidated_report`.

---

## COLLEAGUE REVIEW MODE (REVIEW_MODE == 'colleague')

### 6.1 Prepare Review Context

Collect the changed-files list, diff stats (from step-04), and tracker issue context (from step-03). These become the input contract fields referenced below.

### 6.2 Orchestration message (colleague)

Issue the 5 `Agent()` calls below in a SINGLE orchestrator message. The Claude Code runtime executes them in parallel; results return synchronously in the tool response block.

#### Agent A — Specs Compliance

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Review group A: specs compliance',
  prompt: |
    Read and apply: {reviewPerspectives}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'A'
      perspectives: ['specs_compliance']
      linear_issue:
        identifier: '{ISSUE_IDENTIFIER}'
        description: |
          {ISSUE_DESCRIPTION}
        acceptance_criteria: {AC_LIST}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'
      phase2_suspicious_removals: {PHASE2_SUSPICIOUS_REMOVALS}

    Return a YAML `perspective_report` as defined in the subagent workflow.
    CRITICAL: You are READ-ONLY.
)
```

#### Agent B — QA & Code Quality

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Review group B: QA and code quality',
  prompt: |
    Read and apply: {reviewPerspectives}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'B'
      perspectives: ['qa', 'code_quality']
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` as defined in the subagent workflow.
    CRITICAL: You are READ-ONLY.
)
```

#### Agent C — Tech Lead + Patterns + Commits + Infra

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Review group C: architecture and infra',
  prompt: |
    Read and apply: {reviewPerspectives}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'C'
      perspectives: ['tech_lead', 'patterns', 'commit_history', 'infra_deployability']
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` as defined in the subagent workflow.
    CRITICAL: You are READ-ONLY.
)
```

#### Agent S1 — Security (Attacker POV, low creativity)

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Security S1: attacker POV (voting 1/2)',
  prompt: |
    Read and apply: {reviewPerspectives}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    POV_FRAMING: attacker
    CREATIVITY: low (emulate temperature 0.2 — deterministic, focused)
    DIRECTIVE: |
      Assume an adversary is reading this code looking for exploit paths.
      Enumerate concrete attack vectors, prefer depth on known CVE classes
      over breadth. Only report findings with a plausible exploit chain.

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'S1'
      perspectives: ['security']
      pov: 'attacker'
      temperature_hint: 0.2
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` as defined in the subagent workflow.
    CRITICAL: You are READ-ONLY. Do NOT coordinate with S2.
)
```

#### Agent S2 — Security (Defender POV, medium creativity)

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Security S2: defender POV (voting 2/2)',
  prompt: |
    Read and apply: {reviewPerspectives}
    Read and apply: ~/.claude/skills/bmad-shared/no-fallback-no-false-data.md

    POV_FRAMING: defender
    CREATIVITY: medium (emulate temperature 0.5 — creative, coverage-oriented)
    DIRECTIVE: |
      Assume this code is in production and you are designing defense-in-depth.
      Enumerate classes of risk that could emerge under load, misuse, or
      edge-case inputs. Prefer breadth — surface latent risks even without a
      confirmed exploit chain.

    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'S2'
      perspectives: ['security']
      pov: 'defender'
      temperature_hint: 0.5
      linear_issue: {SAME_AS_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'

    Return a YAML `perspective_report` as defined in the subagent workflow.
    CRITICAL: You are READ-ONLY. Do NOT coordinate with S1.
)
```

All 5 `Agent()` calls run concurrently. Wait for all replies in the tool response block.

### 6.3 Handle Agent Failures

For each agent that returns empty/timeout/parse-error: record in `failed_layers`. Do NOT retry silently — per `bmad-shared/no-fallback-no-false-data.md`, a failed layer must be surfaced to the user rather than substituted with an empty report. The judge step will carry the `failed_layers` field through to the consolidated report.

### 6.4 Collect Reports

Parse the YAML `perspective_report` returned by each agent. Validate each report contains:

- `group_id` matching the dispatched agent
- `perspectives_completed` covering the contract's perspectives
- `findings[]` with `{severity, perspective, file, line, issue, fix}` per finding
- `summary` with severity counts

If validation fails → record in `failed_layers` with the parse error.

### 6.5 Invoke Judge-Triage

Issue a single `Agent()` call — AFTER all reviewer reports have returned — to consolidate:

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Judge-triage: consolidate review reports',
  prompt: |
    Read and apply: {judgeTriage}

    input_reports:
      - group_id: 'A'
        {PERSPECTIVE_REPORT_A}
      - group_id: 'B'
        {PERSPECTIVE_REPORT_B}
      - group_id: 'C'
        {PERSPECTIVE_REPORT_C}
      - group_id: 'S1'
        {PERSPECTIVE_REPORT_S1}
      - group_id: 'S2'
        {PERSPECTIVE_REPORT_S2}

    linear_issue: {SAME_AS_A_OR_NULL}
    regression_risk: {REGRESSION_RISK_FROM_STEP_05}
    model_tier: '{ORCHESTRATOR_MODEL_TIER}'

    Return the YAML `consolidated_report` as defined in the judge-triage subagent workflow.
    CRITICAL: Enforce model parity — you MUST run at the same model tier as the orchestrator.
    CRITICAL: You are READ-ONLY. Do not re-read source files.
)
```

Parse the returned `consolidated_report`. If the judge returns `verdict: REJECTED` with `error: judge_unable_to_consolidate` → HALT (per G1, no fallback).

### 6.6 Apply Trivial Fixes (orchestrator only)

Only the orchestrator runs format/lint — workers are strictly read-only. This prevents concurrent file-edit conflicts.

```bash
cd {REVIEW_WORKTREE_PATH}
{FORMAT_FIX_COMMAND}
```

Note files modified as `trivial_fixes_applied`.

### 6.7 Proceed

Pass the `consolidated_report` to `{nextStepFile}`. No team cleanup needed — parallel `Agent()` calls have no lifecycle beyond their single invocation.

---

## SCORING

All scoring is performed inside `judge-triage` per the matrix in the judge-triage subagent workflow. The orchestrator does NOT re-compute scores — it consumes the `consolidated_report.score_overall`, `scores_per_meta`, and `verdict` directly.

Legacy per-perspective weights (pre-Meta restructure):

| Perspective | Weight |
|-------------|--------|
| specs_compliance | 0.25 |
| security | 0.25 |
| qa | 0.20 |
| code_quality | 0.10 |
| tech_lead | 0.10 |
| zero_fallback | 0.15 |

The zero-fallback weight was raised from 0.10 → 0.15 to reflect its criticality under `no-fallback-no-false-data.md`.

## SUCCESS/FAILURE:

### SUCCESS: All 5 agents report, judge consolidates, verdict computed, report passed to present step

### FAILURE: Skipping an agent, calling sequentially instead of in one orchestrator message, ignoring judge HALT, downgrading BLOCKERs without judge approval, marking PASS without evidence
