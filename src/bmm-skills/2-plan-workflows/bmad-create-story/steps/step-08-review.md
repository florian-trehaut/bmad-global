---
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
adversarialReview: '~/.claude/skills/bmad-review-adversarial-general/SKILL.md'
---

# Step 8: Review & Finalize (Discovery Mode Only)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-08-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-08-ENTRY PASSED — entering Step 8: Review & Finalize (Discovery Mode Only) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present the complete spec to the user for review. Offer editing, questioning, adversarial review, and refinement options before finalizing. This step only runs in Discovery mode — Enrichment mode skips directly to Step 9.

## RULES

- You are presenting work for validation — the user is the final arbiter
- FORBIDDEN: proceeding to issue creation without explicit user approval [C]
- All generation is done — focus on review and refinement
- Loop until user selects [C]

## SEQUENCE

### 1. Present Complete Spec

Present the full spec content assembled from all previous steps:

> Here is the complete spec. Please review:
>
> ---
> {full_spec_content}
> ---
>
> **Summary:**
> - {task_count} implementation tasks
> - {bac_count} business acceptance criteria
> - {tac_count} technical acceptance criteria
> - {vm_count} validation metier tests
> - {files_count} files to modify/create
> - {guardrails_count} guardrails

### 2. Present MENU OPTIONS

Display: "**Select:** [C] Create tracker issue [E] Edit [Q] Questions [A] Advanced Elicitation [P] Party Mode [R] Adversarial Review"

#### Menu Handling Logic:

- IF C: Load, read fully, and execute `./step-09-output.md`
- IF E: Apply user's requested edits, re-present spec, then redisplay menu
- IF Q: Answer questions, then redisplay menu
- IF A: Read fully and follow {advancedElicitationTask}, process, ask "Accept? (y/n)", if yes update spec, then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow}, process, ask "Accept? (y/n)", if yes update spec, then redisplay menu
- IF R: Execute adversarial review (see below), then redisplay menu
- IF any other: Respond helpfully then redisplay menu

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

### Adversarial Review [R] Process

1. Invoke review task: {adversarialReview}
   - If subagent available: run in separate process with spec content only (information asymmetry)
   - Fallback: load task file and follow inline in main context
2. Process findings:
   - If zero findings → suspicious, re-analyze or ask user
   - Evaluate severity (Critical, High, Medium, Low) and validity (real, noise, undecided)
   - DO NOT exclude findings based on severity
   - Order by severity, number as F1, F2, F3...
   - Present as table: ID | Severity | Validity | Description
3. Return to review menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Complete spec presented to user
- All menu options functional (C/E/Q/A/P/R)
- Adversarial review uses {adversarialReview} variable (not hardcoded path)
- User explicitly selects [C] before proceeding

### FAILURE:

- Proceeding without user's explicit [C] selection
- Hardcoding adversarial review path instead of using variable
- Not re-presenting menu after non-C selections

---

## STEP EXIT (CHK-STEP-08-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-08-EXIT PASSED — completed Step 8: Review & Finalize (Discovery Mode Only)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
