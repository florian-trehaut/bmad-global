# Step 2: Impact and Risk Assessment


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Impact and Risk Assessment with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Work through a structured impact assessment checklist and a risk assessment, using real tracker data loaded in step 1. In incremental mode, discuss each item interactively. In batch mode, compile all findings into a single report.

## RULES

- Every finding must reference a real tracker issue/project identifier
- Do NOT propose solutions yet — this step is analysis only
- In incremental mode, present one checklist item at a time and wait for user input before proceeding
- In batch mode, analyze all items silently, then present the full assessment at the end

## SEQUENCE

### 1. Run Impact Assessment checklist

Work through each item below. For each, analyze the `CHANGE_DESCRIPTION` against the sprint snapshot data.

**Impact checklist:**

1. **Affected epics/projects** — Which projects (epics) are directly impacted by this change? List each with its identifier and explain why.

2. **Stories to modify** — Which existing issues need their scope, description, or acceptance criteria updated? List each with its identifier and what needs to change.

3. **In Progress work to stop** — Are there any issues currently In Progress or In Review that should be paused or stopped because of this change? List each with its identifier and reason.

4. **Architecture changes** — Does the change require architectural modifications (data model, API contracts, service boundaries, infrastructure)?

5. **PRD updates** — Does any Product Requirements Document need revision? Which sections?

6. **UX implications** — Are there user experience changes (new screens, modified flows, removed features)?

7. **New stories needed** — What new issues must be created to implement the course correction? Describe each at a high level (title + purpose).

8. **Stories to cancel** — Which existing issues are no longer relevant and should be canceled? List each with its identifier and reason.

**In incremental mode:** present each item, share your analysis, ask {USER_NAME} for confirmation or corrections, then move to the next item.

**In batch mode:** analyze all items, compile findings.

### 2. Run Risk Assessment checklist

Work through each risk dimension:

1. **Cycle fit** — Can the corrective changes fit within the remaining time of the current cycle? Consider the current progress percentage and remaining capacity.

2. **Technical spikes** — Does the change require new technical investigation or proof-of-concept work before implementation?

3. **Dependency changes** — Are there new dependencies (external services, other teams, third-party APIs) introduced by this change?

4. **Regression risk** — What is the impact on already-Done stories? Could the change cause regressions in completed work?

**In incremental mode:** present each risk item, discuss with {USER_NAME}.

**In batch mode:** analyze all risks, compile findings.

### 3. Classify scope

Based on the assessment, classify the overall scope:

- **Minor** — Few stories affected, no architecture changes, fits in current cycle
- **Moderate** — Multiple stories affected, backlog reorganization needed, may extend beyond current cycle
- **Major** — Fundamental changes to architecture/PRD, significant new work, requires replan

Store as `SCOPE_CLASSIFICATION`.

### 4. CHECKPOINT — Present assessment summary

Present the full impact analysis to {USER_NAME}:

```
## Impact Analysis — Course Correction

### Change Description
{CHANGE_DESCRIPTION}

### Impact Summary
- **Affected projects:** {list with identifiers}
- **Stories to modify:** {list with identifiers}
- **In Progress to stop:** {list with identifiers}
- **New stories needed:** {count and high-level list}
- **Stories to cancel:** {list with identifiers}
- **Architecture changes:** {yes/no + details}
- **PRD updates:** {yes/no + details}
- **UX implications:** {yes/no + details}

### Risk Assessment
- **Fits in current cycle?** {yes/no + reasoning}
- **Technical spikes needed?** {yes/no + details}
- **Dependency changes?** {yes/no + details}
- **Regression risk on Done stories?** {low/medium/high + details}

### Scope Classification: {SCOPE_CLASSIFICATION}

---
Do you approve this analysis, or would you like to correct any findings?
```

WAIT for user confirmation.

If {USER_NAME} requests corrections, update the relevant findings and re-present the summary.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Impact and Risk Assessment
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-propose.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
