# Step 6b: DoD & Validation Metier Update


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06b-ENTRY PASSED — entering Step 6b: DoD & Validation Metier Update with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Propose updates to Definition of Done (product), BACs (Business Acceptance Criteria), and Validation Metier based on accepted findings from Step 6. These sections are the CONTRACT between dev and business — if the spec review changed the story's scope, behavior, or edge cases, they MUST be updated to match.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teammate-mode-routing.md`, when TEAMMATE_MODE=true:

- Each proposed DoD/BAC/VM update is presented to the lead via a `question` SendMessage instead of `AskUserQuestion`. The lead either approves directly (from its context) or batches and forwards to the user.
- TAC-18 unwanted-pattern enforcement applies — direct AskUserQuestion in TEAMMATE_MODE → HALT.

When TEAMMATE_MODE=false, proceed with the Mandatory Sequence below as normal.

## RULES

- Only propose updates driven by ACCEPTED or MODIFIED findings from Step 6
- Every new/modified BAC MUST be covered by at least one VM item
- VM items must be concrete, executable by a human in production, from the business perspective
- NEVER propose VM items like "check logs", "verify in database", "check the code" — these are developer tasks, not business validation
- Each VM item must specify the expected result, not just the action

## SEQUENCE

### 1. Analyze impact of accepted findings on DoD/BACs/VM

For each ACCEPTED or MODIFIED finding from Step 6, determine if it impacts:

- **Definition of Done (product)** — Does a DoD criterion need to change, be added, or be removed?
- **BACs** — Does a BAC need updating (Given/When/Then changed)? Are new BACs needed? Are existing BACs now wrong?
- **Validation Metier** — Does a VM need updating? Are new VMs needed to cover new edge cases? Do existing VMs still make sense with the changes?

### 2. Propose updated sections

Present the proposed changes in a clear before/after format:

```
## DoD / BACs / Validation Metier Updates

### Definition of Done (product)

**Proposed changes:**
- {DoD-N modified/added/removed: description + justification (finding F-XXX)}

### BACs

**Proposed changes:**
- {BAC-N modified: old --> new (finding F-XXX)}
- {BAC-N+1 added: Given/When/Then (finding F-XXX)}

### Validation Metier

**Proposed changes:**
- {VM-N modified: updated description (finding F-XXX)}
- {VM-N+1 added *(BAC-X)* : new business test (finding F-XXX)}
```

### 3. VM quality rules

Updated VMs must satisfy ALL of these:

- **Concrete and executable** by a human in a real environment (staging or production)
- **Business perspective** — NEVER "check logs" or "query the database"
- **Traceable to BACs** — format: `VM-N *(BAC-X,Y)* : description`
- **Each new/modified BAC** must be covered by at least one VM
- **Expected result explicit** — not just the action, but what the user should see/observe

### 4. Review with user

Present each proposed change and ask for validation.

WAIT for user confirmation before proceeding to Step 7.

### 5. Proceed

Load and execute `./steps/step-07-finalize.md`.

---

## STEP EXIT (CHK-STEP-06b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06b-EXIT PASSED — completed Step 6b: DoD & Validation Metier Update
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
