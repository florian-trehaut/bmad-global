---
# No nextStepFile -- this is the final step
---

# Step 13: Validation Report Complete


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-13-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-13-ENTRY PASSED — entering No nextStepFile -- this is the final step with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Finalize validation report, summarize all findings from steps 1-12, present summary to user conversationally, and offer actionable next steps.

## RULES

- Focus ONLY on summarizing findings and presenting options
- FORBIDDEN to perform additional validation
- Synthesize existing findings, do not add new ones
- This is the final step -- requires user interaction for next actions

## SEQUENCE

### 1. Load Complete Validation Report

Read the entire validation report from {validation_report_path}.

Extract all findings from:
- Format Detection (Step 2)
- Parity Analysis (Step 2B, if applicable)
- Information Density (Step 3)
- Product Brief Coverage (Step 4)
- Measurability (Step 5)
- Traceability (Step 6)
- Implementation Leakage (Step 7)
- Domain Compliance (Step 8)
- Project-Type Compliance (Step 9)
- SMART Requirements (Step 10)
- Holistic Quality (Step 11)
- Completeness (Step 12)

### 2. Update Report Frontmatter with Final Status

Update validation report frontmatter:

```yaml
---
validationTarget: '{prd_path}'
validationDate: '{current_date}'
inputDocuments: [list of documents]
validationStepsCompleted: ['step-01-discovery', 'step-02-format-detection', 'step-03-density-validation', 'step-04-brief-coverage-validation', 'step-05-measurability-validation', 'step-06-traceability-validation', 'step-07-implementation-leakage-validation', 'step-08-domain-compliance-validation', 'step-09-project-type-validation', 'step-10-smart-validation', 'step-11-holistic-quality-validation', 'step-12-completeness-validation']
validationStatus: COMPLETE
holisticQualityRating: '{rating from step 11}'
overallStatus: '{Pass/Warning/Critical based on all findings}'
---
```

### 3. Create Summary of Findings

**Overall Status:**
Determine from all validation findings:
- **Pass:** All critical checks pass, minor warnings acceptable
- **Warning:** Some issues found but PRD is usable
- **Critical:** Major issues that prevent PRD from being fit for purpose

**Quick Results Table:**
- Format: [classification]
- Information Density: [severity]
- Measurability: [severity]
- Traceability: [severity]
- Implementation Leakage: [severity]
- Domain Compliance: [status]
- Project-Type Compliance: [compliance score]
- SMART Quality: [percentage]
- Holistic Quality: [rating/5]
- Completeness: [percentage]

**Critical Issues:** List from all validation steps
**Warnings:** List from all validation steps
**Strengths:** List positives from all validation steps

**Holistic Quality Rating:** From step 11
**Top 3 Improvements:** From step 11

**Recommendation:** Based on overall status

### 4. Present Summary to User

Display:

"**PRD Validation Complete**

**Overall Status:** {Pass/Warning/Critical}

**Quick Results:**
{Present quick results table with key findings}

**Critical Issues:** {count or "None"}
{If any, list briefly}

**Warnings:** {count or "None"}
{If any, list briefly}

**Strengths:**
{List key strengths}

**Holistic Quality:** {rating}/5 - {label}

**Top 3 Improvements:**
1. {Improvement 1}
2. {Improvement 2}
3. {Improvement 3}

**Recommendation:**
{Based on overall status:
- Pass: "PRD is in good shape. Address minor improvements to make it great."
- Warning: "PRD is usable but has issues that should be addressed. Review warnings and improve where needed."
- Critical: "PRD has significant issues that should be fixed before use. Focus on critical issues above."}

**What would you like to do next?**"

### 5. Present Menu

**[R] Review Detailed Findings** - Walk through validation report section by section
**[E] Use Edit Workflow** - Use validation report with Edit workflow for systematic improvements
**[F] Fix Simpler Items** - Immediate fixes for simple issues (anti-patterns, leakage, missing headers)
**[X] Exit** - Exit and suggest next steps

- ALWAYS halt and wait for user input after presenting menu

Menu handling:

- **IF R:** Walk through validation report section by section, present findings from each step, allow questions. After review, return to menu.

- **IF E:** Explain that the Edit workflow can use this validation report to systematically address issues. Offer to launch Edit mode. If yes: invoke `bmad-edit-prd`, passing the validation report path as context. If no: return to menu.

- **IF F:** Offer immediate fixes for template variables, conversational filler, implementation leakage, missing section headers. Ask which fixes to make. Apply selected fixes, update validation report, return to menu.

- **IF X:** Display "**Validation Report Saved:** {validation_report_path}" and summary. PRD Validation complete. Invoke `bmad-help`.

---

## STEP EXIT (CHK-STEP-13-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-13-EXIT PASSED — completed No nextStepFile -- this is the final step
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-validate-prd executed end-to-end:
  steps_executed: ['01', '02', '02b', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '02b', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
