# Step 4: Diagnose


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Diagnose with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Correlate all evidence, apply structured diagnostic methods, identify the root cause, and present the diagnosis with a fix plan to the user for approval.

## RULES

- Every claim must be backed by evidence from step 3 — no opinions
- Apply diagnostic methods from `troubleshooting-methodology.md`
- Present the full causal chain, not just the proximate cause
- The fix plan must be concrete — file paths, specific changes

## SEQUENCE

### 1. Load methodology reference

Read `../data/troubleshooting-methodology.md` if not already loaded.

### 2. Correlate evidence

Cross-reference all evidence sources:

| Evidence source | Key finding | Consistent with other evidence? |
|----------------|-------------|--------------------------------|
| Logs | {finding} | {yes/no — explain} |
| Database | {finding} | {yes/no — explain} |
| Code | {finding} | {yes/no — explain} |
| Deployment | {finding} | {yes/no — explain} |

Identify convergence points — where multiple evidence sources point to the same conclusion.

### 3. Apply diagnostic method

Choose the most appropriate method based on evidence:

**If clear error location from logs/code** → Divide and Conquer
- Trace the pipeline from entry to error
- Binary search the exact failure point

**If regression suspected (deploy correlation)** → Git Bisect analysis
- Identify the suspect commit range
- Correlate changed files with affected feature

**If proximate cause found but systemic cause unclear** → Five Whys
- Build the causal chain from symptom to root cause
- Stop when a systemic fix is reachable

**If confusion about what IS vs IS NOT affected** → Kepner-Tregoe IS/IS-NOT
- Fill the IS/IS-NOT matrix
- Find the distinguishing factor

### 4. Formulate diagnosis

```
## Diagnosis

### Root Cause
{One paragraph: what is wrong and why}

### Causal Chain
{Five Whys or equivalent chain}

### Confidence Level
{HIGH / MEDIUM / LOW — with justification}

### Evidence Trail
| # | Type | Source | Finding |
|---|------|--------|---------|
| E1 | {type} | {source} | {finding} |

### Proposed Fix Plan
- [ ] Task 1: {description}
  - File: `{path}`
  - Action: {specific change}
- [ ] Task 2: ...

### Acceptance Criteria
- [ ] BAC-1: Given {context}, when {action}, then {expected_result}
- [ ] TAC-1: Given {precondition}, when {system_action}, then {expected_result}

### Validation Metier (staging tests after fix)
- [ ] VM-1 *(BAC-1)*: {concrete test in staging}

### Similar Patterns
{Other places in the codebase with the same bug pattern, if any}
```

### 5. CHECKPOINT

Present the full diagnosis to the user:

"Here is my diagnosis based on the evidence collected:"

{diagnosis}

"Do you agree with this diagnosis and fix plan? Options:"
- **[Y]** Proceed — create issue and implement the fix
- **[R]** Re-investigate — I have additional context (describe what to look at)
- **[M]** Modify the fix plan — the diagnosis is right but the fix needs adjustment

WAIT for user response.

- **IF Y:** proceed to next step
- **IF R:** return to step 03 with the new context (one retry max — if second R, HALT)
- **IF M:** apply modifications to the fix plan, re-present, WAIT again
- **IF other:** explain options and re-present

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Diagnose
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./steps/step-05-create-issue.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
