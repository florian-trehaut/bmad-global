---
nextStepFile: './step-04-brief-coverage-validation.md'
---

# Step 3: Information Density Validation


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
CHK-STEP-03-ENTRY PASSED — entering Step 3: Information Density Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Validate PRD meets BMAD information density standards by scanning for conversational filler, wordy phrases, and redundant expressions that violate conciseness principles.

## RULES

- Focus ONLY on information density anti-patterns
- FORBIDDEN to validate other aspects in this step
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Attempt subprocess first, fall back to direct analysis if unavailable

## SEQUENCE

### 1. Attempt Sub-Process Validation

Try to use Task tool to spawn a subprocess:

"Perform information density validation on this PRD:

1. Load the PRD file
2. Scan for the following anti-patterns:
   - Conversational filler phrases (examples: 'The system will allow users to...', 'It is important to note that...', 'In order to')
   - Wordy phrases (examples: 'Due to the fact that', 'In the event of', 'For the purpose of')
   - Redundant phrases (examples: 'Future plans', 'Absolutely essential', 'Past history')
3. Count violations by category with line numbers
4. Classify severity: Critical (>10 violations), Warning (5-10), Pass (<5)

Return structured findings with counts and examples."

### 2. Direct Analysis (if Task tool unavailable)

If Task tool unavailable, perform analysis directly:

**Scan for conversational filler patterns:**
- "The system will allow users to..."
- "It is important to note that..."
- "In order to"
- "For the purpose of"
- "With regard to"
- Count occurrences and note line numbers

**Scan for wordy phrases:**
- "Due to the fact that" (use "because")
- "In the event of" (use "if")
- "At this point in time" (use "now")
- "In a manner that" (use "how")
- Count occurrences and note line numbers

**Scan for redundant phrases:**
- "Future plans" (just "plans")
- "Past history" (just "history")
- "Absolutely essential" (just "essential")
- "Completely finish" (just "finish")
- Count occurrences and note line numbers

### 3. Classify Severity

Calculate total violations:
- Conversational filler count
- Wordy phrases count
- Redundant phrases count
- Total = sum of all categories

Determine severity:
- **Critical:** Total > 10 violations
- **Warning:** Total 5-10 violations
- **Pass:** Total < 5 violations

### 4. Report Density Findings to Validation Report

Append to validation report:

```markdown
## Information Density Validation

**Anti-Pattern Violations:**

**Conversational Filler:** {count} occurrences
[If count > 0, list examples with line numbers]

**Wordy Phrases:** {count} occurrences
[If count > 0, list examples with line numbers]

**Redundant Phrases:** {count} occurrences
[If count > 0, list examples with line numbers]

**Total Violations:** {total}

**Severity Assessment:** [Critical/Warning/Pass]

**Recommendation:**
[If Critical] "PRD requires significant revision to improve information density. Every sentence should carry weight without filler."
[If Warning] "PRD would benefit from reducing wordiness and eliminating filler phrases."
[If Pass] "PRD demonstrates good information density with minimal violations."
```

### 5. Display Progress and Auto-Proceed

Display: "**Information Density Validation Complete**

Severity: {Critical/Warning/Pass}

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Information Density Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
