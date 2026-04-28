# Step 3: Generate Quality Review Report


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Generate Quality Review Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Compose the complete test quality review report and present it to the user. The report is output directly in the conversation (not saved to a file), unless the user requests file output.

## RULES

- The report must be self-contained — readable without access to the workflow state
- Use `{COMMUNICATION_LANGUAGE}` from workflow-context.md for all report content
- Every violation must include file:line, KB reference, current code snippet, and recommended fix
- Do not fabricate code snippets — use actual code from the test files
- If the user requests file output, save to the project's test artifacts directory

## SEQUENCE

### 1. Compose the report

Build the report using the following structure:

```markdown
# Test Quality Review

**Score:** {FINAL_SCORE}/100 ({GRADE} - {ASSESSMENT})
**Date:** {current date}
**Scope:** {REVIEW_SCOPE} — {file/directory/suite path}
**Framework:** {TEST_FRAMEWORK}
**Files Reviewed:** {count}

---

## Executive Summary

**Overall Assessment:** {Excellent | Good | Acceptable | Needs Improvement | Critical Issues}
**Recommendation:** {Approve | Approve with Comments | Request Changes | Block}

### Strengths
- {strength_1 — specific, citing actual patterns found}
- {strength_2}
- {strength_3}

### Weaknesses
- {weakness_1 — specific, citing actual violations found}
- {weakness_2}
- {weakness_3}

{1-2 paragraph summary of overall quality, key findings, and recommendation rationale}

---

## Dimension Scores

| Dimension | Score | Grade | Violations | Weight |
|-----------|-------|-------|------------|--------|
| Determinism | {score}/100 | {grade} | {count} | 25% |
| Isolation | {score}/100 | {grade} | {count} | 25% |
| Maintainability | {score}/100 | {grade} | {count} | 20% |
| Coverage | {score}/100 | {grade} | {count} | 15% |
| Performance | {score}/100 | {grade} | {count} | 15% |

**Bonus Points:** +{bonus} (max +15)

---

## Score Breakdown

Starting Score:          100
HIGH Violations:         -{HIGH_COUNT} x 10 = -{high_deduction}
MEDIUM Violations:       -{MEDIUM_COUNT} x 5 = -{medium_deduction}
LOW Violations:          -{LOW_COUNT} x 2 = -{low_deduction}
Bonus Points:            +{bonus}
                         --------
Final Score:             {FINAL_SCORE}/100
Grade:                   {GRADE}

---

## Critical Issues (Must Fix)

{For each HIGH severity violation:}

### {number}. {Issue Title}

**Severity:** HIGH
**Dimension:** {dimension_name}
**Location:** `{file}:{line}`
**KB Reference:** `{fragment_name}.md`

**Issue:**
{Clear explanation of the problem and why it matters}

**Current Code:**
```{language}
// Current implementation at {file}:{line}
{actual code snippet from the test file}
```

**Recommended Fix:**
```{language}
// Recommended approach — see {fragment_name}.md
{code showing the correct pattern}
```

---

## Recommendations (Should Fix)

{For each MEDIUM severity violation:}

### {number}. {Recommendation Title}

**Severity:** MEDIUM
**Dimension:** {dimension_name}
**Location:** `{file}:{line}`
**KB Reference:** `{fragment_name}.md`

**Issue:** {explanation}

**Current Code:**
```{language}
{actual code snippet}
```

**Recommended Improvement:**
```{language}
{improved code}
```

---

## Minor Notes

{For each LOW severity violation, in compact table format:}

| Location | Dimension | Issue | Fix |
|----------|-----------|-------|-----|
| `{file}:{line}` | {dimension} | {brief issue} | {brief fix} |

---

## Best Practices Found

{If good patterns were found, highlight them:}

### {number}. {Pattern Name}

**Location:** `{file}:{line}`
**Pattern:** {pattern from KB}

{Why this is good and should be used as reference}

---

## Context Integration

{If story context was available:}

### Acceptance Criteria Coverage

| Criterion | Test | Status |
|-----------|------|--------|
| {AC_1} | {test_id or file:line} | Covered / Missing |

**Coverage:** {covered}/{total} ({percentage}%)

{If test-design context was available:}

### Priority Alignment

| Priority | Expected Tests | Found | Status |
|----------|---------------|-------|--------|
| P0 | {count} | {found} | Aligned / Gap |
| P1 | {count} | {found} | Aligned / Gap |

---

## Knowledge Base References

This review applied quality criteria from:

{List each KB fragment that was consulted, with the specific rules applied}

---

## Next Steps

### Immediate (Before Merge)
1. {action — with priority and estimated effort}
2. {action}

### Follow-up (Future PRs)
1. {action — with priority}
2. {action}

### Re-Review Needed?
{Yes/No with rationale}
```

### 2. Present the report

Output the composed report directly in the conversation.

### 3. Offer file output

After presenting the report, ask:

> "Report complete. Save to a file? If yes, provide the output path (or I'll use the project's test artifacts directory if configured)."

If the user provides a path, write the report to that file.

### 4. Completion summary

Present a brief summary:

> **Test Quality Review Complete**
> - **Score:** {FINAL_SCORE}/100 ({GRADE})
> - **Files Reviewed:** {count}
> - **Violations:** {HIGH_COUNT} HIGH, {MEDIUM_COUNT} MEDIUM, {LOW_COUNT} LOW
> - **Recommendation:** {recommendation}

---

## END OF WORKFLOW

The bmad-tea-test-review workflow is complete.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Generate Quality Review Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-tea-test-review executed end-to-end:
  steps_executed: ['01', '02', '03']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
