---
nextStepFile: './step-06-traceability-validation.md'
---

# Step 5: Measurability Validation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Measurability Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Validate that all Functional Requirements (FRs) and Non-Functional Requirements (NFRs) are measurable, testable, and follow proper format without implementation details.

## RULES

- Focus ONLY on FR and NFR measurability
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Validate each requirement individually, not in aggregate
- Attempt subprocess first, fall back to direct analysis if unavailable

## SEQUENCE

### 1. Attempt Sub-Process Validation

Try to use Task tool to spawn a subprocess:

"Perform measurability validation on this PRD:

**Functional Requirements (FRs):**
1. Extract all FRs from Functional Requirements section
2. Check each FR for:
   - '[Actor] can [capability]' format compliance
   - No subjective adjectives (easy, fast, simple, intuitive, etc.)
   - No vague quantifiers (multiple, several, some, many, etc.)
   - No implementation details (technology names, library names, data structures unless capability-relevant)
3. Document violations with line numbers

**Non-Functional Requirements (NFRs):**
1. Extract all NFRs from Non-Functional Requirements section
2. Check each NFR for:
   - Specific metrics with measurement methods
   - Template compliance (criterion, metric, measurement method, context)
   - Context included (why this matters, who it affects)
3. Document violations with line numbers

Return structured findings with violation counts and examples."

### 2. Direct Analysis (if Task tool unavailable)

If Task tool unavailable, perform analysis directly:

**Functional Requirements Analysis:**

Extract all FRs and check each for:

**Format compliance:**
- Does it follow "[Actor] can [capability]" pattern?
- Is actor clearly defined?
- Is capability actionable and testable?

**No subjective adjectives:**
- Scan for: easy, fast, simple, intuitive, user-friendly, responsive, quick, efficient (without metrics)
- Note line numbers

**No vague quantifiers:**
- Scan for: multiple, several, some, many, few, various, number of
- Note line numbers

**No implementation details:**
- Scan for: React, Vue, Angular, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, Redux, etc.
- Unless capability-relevant (e.g., "API consumers can access...")
- Note line numbers

**Non-Functional Requirements Analysis:**

Extract all NFRs and check each for:

**Specific metrics:**
- Is there a measurable criterion? (e.g., "response time < 200ms", not "fast response")
- Can this be measured or tested?

**Template compliance:**
- Criterion defined?
- Metric specified?
- Measurement method included?
- Context provided?

### 3. Tally Violations

**FR Violations:**
- Format violations: count
- Subjective adjectives: count
- Vague quantifiers: count
- Implementation leakage: count
- Total FR violations: sum

**NFR Violations:**
- Missing metrics: count
- Incomplete template: count
- Missing context: count
- Total NFR violations: sum

**Total violations:** FR violations + NFR violations

### 4. Report Measurability Findings to Validation Report

Append to validation report:

```markdown
## Measurability Validation

### Functional Requirements

**Total FRs Analyzed:** {count}

**Format Violations:** {count}
[If violations exist, list examples with line numbers]

**Subjective Adjectives Found:** {count}
[If found, list examples with line numbers]

**Vague Quantifiers Found:** {count}
[If found, list examples with line numbers]

**Implementation Leakage:** {count}
[If found, list examples with line numbers]

**FR Violations Total:** {total}

### Non-Functional Requirements

**Total NFRs Analyzed:** {count}

**Missing Metrics:** {count}
[If missing, list examples with line numbers]

**Incomplete Template:** {count}
[If incomplete, list examples with line numbers]

**Missing Context:** {count}
[If missing, list examples with line numbers]

**NFR Violations Total:** {total}

### Overall Assessment

**Total Requirements:** {FRs + NFRs}
**Total Violations:** {FR violations + NFR violations}

**Severity:** [Critical if >10 violations, Warning if 5-10, Pass if <5]

**Recommendation:**
[If Critical] "Many requirements are not measurable or testable. Requirements must be revised to be testable for downstream work."
[If Warning] "Some requirements need refinement for measurability. Focus on violating requirements above."
[If Pass] "Requirements demonstrate good measurability with minimal issues."
```

### 5. Display Progress and Auto-Proceed

Display: "**Measurability Validation Complete**

Total Violations: {count} ({severity})

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Measurability Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
