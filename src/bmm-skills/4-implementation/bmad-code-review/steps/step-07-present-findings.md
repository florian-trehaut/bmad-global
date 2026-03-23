---
nextStepFile: './step-08-post-findings.md'
---

# Step 7: Present Findings

## STEP GOAL:

Present all review findings to the user, categorized by severity, and let them choose the output method.

## MANDATORY SEQUENCE

### 1. Categorize Findings by Severity

**MANDATORY: Present ALL findings from ALL agents. No filtering, no dropping, no deprioritizing.** Every finding regardless of severity MUST appear in the presentation and MUST be posted in step-08. The reviewer does NOT decide which findings are "worth showing" — all findings are shown, all findings are posted.

- **BLOCKER:** Security vulnerabilities, data loss risk, broken functionality, forbidden patterns, AC not implemented, zero-fallback violations, regression risk (HIGH)
- **WARNING:** Missing tests, poor error handling, performance concerns, regression risk (MEDIUM), single-reviewer security findings
- **RECOMMENDATION:** Style, naming, minor improvements
- **QUESTION:** Intent unclear, needs clarification from author

### 2. Include Regression Risk Findings

Merge findings from step-05 into the presentation:
- Phase 1 HIGH RISK -> BLOCKER
- Phase 1 MEDIUM RISK -> WARNING
- Phase 2 suspicious removals out of scope -> BLOCKER
- Phase 2 suspicious removals in scope but unjustified -> WARNING

### 3. Display Findings

Group by file, then by severity within each file.

```markdown
## Code Review Report — !{MR_IID}

**Verdict:** {APPROVED | NEEDS_WORK | REJECTED}
**Score:** {overall_score} (min perspective: {min_perspective_name} = {min_score})

### Summary
- {blocker_count} BLOCKER
- {warning_count} WARNING
- {recommendation_count} RECOMMENDATION
- {question_count} QUESTION

### Regression Risk
{Phase 1 and Phase 2 results summary, or "No regression risk detected"}

### Findings

#### BLOCKERS

**{file_path}:{line}** [{perspective}]
{description}
Fix: {suggested_fix}

#### WARNINGS

**{file_path}:{line}** [{perspective}]
{description}
Fix: {suggested_fix}

#### RECOMMENDATIONS

**{file_path}:{line}** [{perspective}]
{description}

#### QUESTIONS

**{file_path}:{line}** [{perspective}]
{question}

### AC Coverage (if tracker issue linked)

| AC  | Status           | Implementation    | Test              |
| --- | ---------------- | ----------------- | ----------------- |
| AC1 | COMPLIANT        | file.ts:23        | file.spec.ts:45   |
| AC2 | PARTIAL          | file.ts:67        | --                |
| AC3 | NOT_IMPLEMENTED  | --                | --                |

### Trivial Fixes Applied
{list of auto-fixed formatting/lint issues, or "None"}
```

### 4. Ask User for Output Method

<check if="colleague review (REVIEW_MODE == 'colleague')">
  Present options:

  ```
  How to proceed?

  [1] Post findings as DiffNotes on the forge (recommended)
  [2] Post findings as tracker comment only
  [3] Both forge DiffNotes + tracker comment

  Choice:
  ```
</check>

<check if="self-review (REVIEW_MODE == 'self')">
  Present options:

  ```
  How to proceed?

  [1] Fix all issues automatically
  [2] Create action items as tracker comment
  [3] Post as tracker comment for tracking

  Choice:
  ```
</check>

WAIT for user choice. Store as `OUTPUT_METHOD`.

Proceed to {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All findings presented clearly, user chose output method
### FAILURE: Hiding findings, auto-selecting output without user input
