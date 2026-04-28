---
nextStepFile: './step-03-evaluate.md'
---

# Step 2: Fact-Check


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Fact-Check with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Verify every technical claim in the ADR against the actual codebase. Mark each claim as VERIFIED, UNVERIFIED, or CONTRADICTED with evidence.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are an impartial fact-checker — report what the evidence shows
- A claim being UNVERIFIED is not the same as CONTRADICTED — be precise
- Do not assume claims are true because they seem plausible

### Step-Specific Rules:

- ALL codebase searches run inside `{WORKTREE_PATH}`
- Every claim must have a verification attempt — no skipping
- Evidence must be concrete: file:line references, grep results, command output

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Loop menu until user selects 'C'

---

## MANDATORY SEQUENCE

### 1. Extract Technical Claims

Scan ALL parsed ADR sections for technical claims — statements about:

- Current system state ("we use X", "the system currently does Y")
- Technology capabilities ("X supports Y", "X can handle Z")
- Architecture ("component A communicates with B via C")
- Performance ("current latency is Xms", "handles Y requests/sec")
- Dependencies ("we depend on X version Y")
- Code patterns ("the codebase follows pattern X")

Store each claim with its source section and exact quote.

### 2. Verify Each Claim

For each extracted claim, search the codebase in `{WORKTREE_PATH}`:

```bash
# Example verification approaches:
# Technology usage: grep for import/require/dependency
grep -r "{technology}" {WORKTREE_PATH} --include="*.{ext}"

# Architecture claims: search for integration patterns
grep -r "{component}" {WORKTREE_PATH} --include="*.{ext}"

# Configuration: check config files
find {WORKTREE_PATH} -name "*.{config_ext}" | xargs grep "{pattern}"

# Dependencies: check package files
cat {WORKTREE_PATH}/package.json  # or Cargo.toml, go.mod, etc.
```

Mark each claim:

| Status | Meaning | Evidence Required |
|--------|---------|------------------|
| **VERIFIED** | Evidence confirms the claim | File:line reference or command output |
| **UNVERIFIED** | No evidence found — cannot confirm or deny | Search queries attempted and results |
| **CONTRADICTED** | Evidence contradicts the claim | File:line reference showing contradiction |

### 3. Generate FACT_CHECK Findings

For each CONTRADICTED or UNVERIFIED claim, create a finding per the schema in `data/review-criteria.md`:

- CONTRADICTED → severity BLOCKER
- UNVERIFIED on critical decision driver → severity MAJOR
- UNVERIFIED on context/background → severity MINOR

### 4. Present Fact-Check Results

> **Fact-Check Results — {total_claims} claims analyzed**
>
> | # | Claim | Section | Status | Evidence |
> |---|-------|---------|--------|----------|
> | 1 | "{claim_text}" | {section} | {VERIFIED/UNVERIFIED/CONTRADICTED} | {brief evidence} |
> | 2 | ... | ... | ... | ... |
>
> **Summary:** {verified_count} VERIFIED, {unverified_count} UNVERIFIED, {contradicted_count} CONTRADICTED
>
> {If any findings generated:}
> **Findings generated:** {N} ({blocker_count} BLOCKER, {major_count} MAJOR, {minor_count} MINOR)

### 5. Update WIP

Add step 2 to `stepsCompleted`. Store claims and findings.

### 6. Present Menu

> **[C]** Continue to reasoning evaluation (Step 3)
> **[Q]** Questions — ask about specific claims or evidence

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **Q**: Answer questions about claims, methodology, or evidence. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- ALL technical claims extracted and verification attempted
- Each claim has concrete evidence (file:line or search results)
- CONTRADICTED claims generate BLOCKER findings
- Results presented clearly before proceeding

### FAILURE:

- Skipping claims ("too many to check")
- Marking claims as VERIFIED without evidence
- Not searching the codebase (relying on LLM knowledge instead)
- Auto-proceeding without presenting results

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Fact-Check
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
