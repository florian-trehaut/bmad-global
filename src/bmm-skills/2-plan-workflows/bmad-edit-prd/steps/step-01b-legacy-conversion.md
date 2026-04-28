---
nextStepFile: './step-02-review.md'
prdFile: '{prd_file_path}'
prdPurpose: '../data/prd-purpose.md'
---

# Step 1B: Legacy PRD Conversion Assessment


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01b-ENTRY PASSED — entering Step 1B: Legacy PRD Conversion Assessment with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Analyze legacy PRD against BMAD standards, identify gaps per section, estimate conversion effort, propose conversion strategy, and let user choose how to proceed.

## RULES

- Focus on conversion assessment and proposal only -- do not perform the conversion yet
- Analyze all 6 BMAD core sections individually with gap and effort estimates
- Provide a clear recommendation based on effort level and user goals
- Do not proceed without user selecting a conversion strategy
- Communicate in `{COMMUNICATION_LANGUAGE}`

## SEQUENCE

### 1. Perform Gap Assessment

Analyze the legacy PRD against BMAD standards (from prd-purpose.md already loaded in step 1).

For each of the 6 BMAD core sections, determine:

**Executive Summary:**

- Present: [Yes/No/Partial]
- Gap: [what's missing or incomplete]
- Effort to Complete: [Minimal/Moderate/Significant]

**Success Criteria:**

- Present: [Yes/No/Partial]
- Gap: [what's missing or incomplete]
- Effort to Complete: [Minimal/Moderate/Significant]

**Product Scope:**

- Present: [Yes/No/Partial]
- Gap: [what's missing or incomplete]
- Effort to Complete: [Minimal/Moderate/Significant]

**User Journeys:**

- Present: [Yes/No/Partial]
- Gap: [what's missing or incomplete]
- Effort to Complete: [Minimal/Moderate/Significant]

**Functional Requirements:**

- Present: [Yes/No/Partial]
- Gap: [what's missing or incomplete]
- Effort to Complete: [Minimal/Moderate/Significant]

**Non-Functional Requirements:**

- Present: [Yes/No/Partial]
- Gap: [what's missing or incomplete]
- Effort to Complete: [Minimal/Moderate/Significant]

**Overall Assessment:**

- Sections Present: {count}/6
- Total Conversion Effort: [Quick/Moderate/Substantial]
- Recommended: [Full restructuring / Targeted improvements]

### 2. Present Conversion Assessment

"**Legacy PRD Conversion Assessment**

**Current PRD Structure:**

- Core sections present: {count}/6
  {List which sections are present/missing}

**Gap Analysis:**
{Present gap analysis table showing each section's status and effort}

**Overall Conversion Effort:** {effort level}

**Your Edit Goals:**
{Reiterate user's stated edit requirements}

**Recommendation:**
{Based on effort and user goals, recommend best approach}

How would you like to proceed?"

### 3. Menu

**[R] Restructure to BMAD** - Full conversion to BMAD format, then apply your edits
**[I] Targeted Improvements** - Apply your edits to existing structure without restructuring
**[E] Edit & Restructure** - Do both: convert format AND apply your edits
**[X] Exit** - Review assessment and decide later

WAIT for user input.

- IF R: Note conversion mode = "Full restructuring"
- IF I: Note conversion mode = "Targeted improvements"
- IF E: Note conversion mode = "Both"
- IF X: Display summary, exit

### 4. Document Conversion Strategy

Store conversion decision for next step:

- **Conversion mode:** [Full restructuring / Targeted improvements / Both]
- **Edit requirements:** [user's requirements from step 1]
- **Gap analysis:** [summary of gaps identified]

"**Conversion Strategy Documented**

Mode: {conversion mode}
Edit goals: {summary}

Proceeding to deep review..."

Read fully and follow: {nextStepFile}

---

## STEP EXIT (CHK-STEP-01b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01b-EXIT PASSED — completed Step 1B: Legacy PRD Conversion Assessment
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
