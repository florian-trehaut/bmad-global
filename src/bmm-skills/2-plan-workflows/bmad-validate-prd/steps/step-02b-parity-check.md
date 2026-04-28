---
nextStepFile: './step-03-density-validation.md'
---

# Step 2B: Document Parity Check


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02b-ENTRY PASSED — entering Step 2B: Document Parity Check with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Analyze non-standard PRD and identify gaps to achieve BMAD PRD parity, presenting user with options for how to proceed.

## RULES

- Focus ONLY on analyzing gaps and estimating parity effort
- FORBIDDEN to perform other validation checks in this step
- FORBIDDEN to proceed without user selection
- Systematic gap analysis with clear recommendations

## SEQUENCE

### 1. Analyze Each BMAD PRD Section

For each of the 6 BMAD PRD core sections, analyze:

**Executive Summary:**
- Does PRD have vision/overview?
- Is problem statement clear?
- Are target users identified?
- Gap: [What's missing or incomplete]

**Success Criteria:**
- Are measurable goals defined?
- Is success clearly defined?
- Gap: [What's missing or incomplete]

**Product Scope:**
- Is scope clearly defined?
- Are in-scope items listed?
- Are out-of-scope items listed?
- Gap: [What's missing or incomplete]

**User Journeys:**
- Are user types/personas identified?
- Are user flows documented?
- Gap: [What's missing or incomplete]

**Functional Requirements:**
- Are features/capabilities listed?
- Are requirements structured?
- Gap: [What's missing or incomplete]

**Non-Functional Requirements:**
- Are quality attributes defined?
- Are performance/security/etc. requirements documented?
- Gap: [What's missing or incomplete]

### 2. Estimate Effort to Reach Parity

For each missing or incomplete section, estimate:

**Effort Level:**
- Minimal - Section exists but needs minor enhancements
- Moderate - Section missing but content exists elsewhere in PRD
- Significant - Section missing, requires new content creation

**Total Parity Effort:** Based on individual section estimates. Classify overall: Quick / Moderate / Substantial effort.

### 3. Report Parity Analysis to Validation Report

Append to validation report:

```markdown
## Parity Analysis (Non-Standard PRD)

### Section-by-Section Gap Analysis

**Executive Summary:**
- Status: [Present/Missing/Incomplete]
- Gap: [specific gap description]
- Effort to Complete: [Minimal/Moderate/Significant]

**Success Criteria:**
- Status: [Present/Missing/Incomplete]
- Gap: [specific gap description]
- Effort to Complete: [Minimal/Moderate/Significant]

**Product Scope:**
- Status: [Present/Missing/Incomplete]
- Gap: [specific gap description]
- Effort to Complete: [Minimal/Moderate/Significant]

**User Journeys:**
- Status: [Present/Missing/Incomplete]
- Gap: [specific gap description]
- Effort to Complete: [Minimal/Moderate/Significant]

**Functional Requirements:**
- Status: [Present/Missing/Incomplete]
- Gap: [specific gap description]
- Effort to Complete: [Minimal/Moderate/Significant]

**Non-Functional Requirements:**
- Status: [Present/Missing/Incomplete]
- Gap: [specific gap description]
- Effort to Complete: [Minimal/Moderate/Significant]

### Overall Parity Assessment

**Overall Effort to Reach BMAD Standard:** [Quick/Moderate/Substantial]
**Recommendation:** [Brief recommendation based on analysis]
```

### 4. Present Parity Analysis and Options

Display:

"**Parity Analysis Complete**

Your PRD is missing {count} of 6 core BMAD PRD sections. The overall effort to reach BMAD standard is: **{effort level}**

**Quick Summary:**
[2-3 sentence summary of key gaps]

**Recommendation:**
{recommendation from analysis}

**How would you like to proceed?**"

### 5. Present Menu

**[C] Continue Validation** - Proceed with validation using current structure
**[E] Exit & Review** - Exit validation and review parity report
**[S] Save & Exit** - Save parity report and exit

- ALWAYS halt and wait for user input

Menu handling:

- IF C: Display "Proceeding with validation..." then read fully and follow: {nextStepFile}
- IF E: Display parity summary and exit validation
- IF S: Confirm saved, display summary, exit

---

## STEP EXIT (CHK-STEP-02b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02b-EXIT PASSED — completed Step 2B: Document Parity Check
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
