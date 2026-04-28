---
nextStepFile: './step-11-holistic-quality-validation.md'
---

# Step 10: SMART Requirements Validation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-10-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-10-ENTRY PASSED — entering Step 10: SMART Requirements Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Validate Functional Requirements meet SMART quality criteria (Specific, Measurable, Attainable, Relevant, Traceable), ensuring high-quality requirements.

## RULES

- Focus ONLY on FR quality assessment using SMART framework
- Score each FR on all 5 criteria using 1-5 scale
- Flag any FR with score < 3 in any category
- This step runs autonomously -- no user input needed, auto-proceeds when complete

## SEQUENCE

### 1. Extract All Functional Requirements

From the PRD's Functional Requirements section, extract:
- All FRs with their FR numbers (FR-001, FR-002, etc.)
- Count total FRs

### 2. Attempt Sub-Process Validation

Try to use Task tool to spawn a subprocess:

"Perform SMART requirements validation on these Functional Requirements:

{List all FRs}

**For each FR, score on SMART criteria (1-5 scale):**

**Specific (1-5):**
- 5: Clear, unambiguous, well-defined
- 3: Somewhat clear but could be more specific
- 1: Vague, ambiguous, unclear

**Measurable (1-5):**
- 5: Quantifiable metrics, testable
- 3: Partially measurable
- 1: Not measurable, subjective

**Attainable (1-5):**
- 5: Realistic, achievable with constraints
- 3: Probably achievable but uncertain
- 1: Unrealistic, technically infeasible

**Relevant (1-5):**
- 5: Clearly aligned with user needs and business objectives
- 3: Somewhat relevant but connection unclear
- 1: Not relevant, doesn't align with goals

**Traceable (1-5):**
- 5: Clearly traces to user journey or business objective
- 3: Partially traceable
- 1: Orphan requirement, no clear source

**For each FR with score < 3 in any category:**
- Provide specific improvement suggestions

Return scoring table with all FR scores and improvement suggestions for low-scoring FRs."

If no Task tool, manually score each FR on SMART criteria, note low scores, provide improvement suggestions.

### 3. Build Scoring Table

For each FR:
- FR number
- Specific score (1-5)
- Measurable score (1-5)
- Attainable score (1-5)
- Relevant score (1-5)
- Traceable score (1-5)
- Average score
- Flag if any category < 3

Calculate overall FR quality:
- Percentage of FRs with all scores >= 3
- Percentage of FRs with all scores >= 4
- Average score across all FRs and categories

### 4. Report SMART Findings to Validation Report

Append to validation report:

```markdown
## SMART Requirements Validation

**Total Functional Requirements:** {count}

### Scoring Summary

**All scores >= 3:** {percentage}% ({count}/{total})
**All scores >= 4:** {percentage}% ({count}/{total})
**Overall Average Score:** {average}/5.0

### Scoring Table

| FR # | Specific | Measurable | Attainable | Relevant | Traceable | Average | Flag |
|------|----------|------------|------------|----------|-----------|--------|------|
| FR-001 | {s1} | {m1} | {a1} | {r1} | {t1} | {avg1} | {X if any <3} |
| FR-002 | {s2} | {m2} | {a2} | {r2} | {t2} | {avg2} | {X if any <3} |
[Continue for all FRs]

**Legend:** 1=Poor, 3=Acceptable, 5=Excellent
**Flag:** X = Score < 3 in one or more categories

### Improvement Suggestions

**Low-Scoring FRs:**

**FR-{number}:** {specific suggestion for improvement}
[For each FR with score < 3 in any category]

### Overall Assessment

**Severity:** [Critical if >30% flagged FRs, Warning if 10-30%, Pass if <10%]

**Recommendation:**
[If Critical] "Many FRs have quality issues. Revise flagged FRs using SMART framework to improve clarity and testability."
[If Warning] "Some FRs would benefit from SMART refinement. Focus on flagged requirements above."
[If Pass] "Functional Requirements demonstrate good SMART quality overall."
```

### 5. Display Progress and Auto-Proceed

Display: "**SMART Requirements Validation Complete**

FR Quality: {percentage}% with acceptable scores ({severity})

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

---

## STEP EXIT (CHK-STEP-10-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-10-EXIT PASSED — completed Step 10: SMART Requirements Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
