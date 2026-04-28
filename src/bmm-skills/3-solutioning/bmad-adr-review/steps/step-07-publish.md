---
nextStepFile: './step-08-cleanup.md'
---

# Step 7: Publish Review Report


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-07-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-07-ENTRY PASSED — entering Step 7: Publish Review Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Compose the review report from the template and publish to the appropriate destination based on ADR source.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- The report is the permanent artifact — ensure it is complete and accurate
- Always present the report to the user BEFORE publishing
- Never publish without explicit user confirmation

### Step-Specific Rules:

- Load the report template — do not compose from memory
- Include ONLY accepted findings (not rejected or skipped)
- The user decides the publication destination if ambiguous

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file after publishing

---

## MANDATORY SEQUENCE

### 1. Load Report Template

Read `./templates/review-report.md`.

### 2. Compose Report

Fill the template with:
- ADR title, date, reviewer name, source type and reference
- Verdict and confidence
- Findings summary (counts by severity and category)
- Detailed findings (ACCEPTED only, ordered by severity)
- Anti-pattern detection results
- Alternative analysis results
- NFR readiness scan results
- Verdict justification and conditions/blockers

### 3. Present Report to User

Display the complete report and ask for confirmation:

> **Review report composed. Preview:**
>
> {full report content}
>
> **Publication destination:** {destination}
>
> **[P]** Publish | **[E]** Edit report | **[D]** Change destination | **[S]** Save locally only

WAIT for user selection.

### 4. Determine Destination

Default destination based on ADR source type:

| ADR Source | Default Destination | Method |
|-----------|-------------------|--------|
| `mr` | Comment on the MR/PR | `{FORGE_CLI} pr comment {N} --body "{report}"` |
| `tracker` | Comment on the tracker issue | Create comment (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) |
| `file` | New file next to the ADR | Write to `{adr_dir}/review-{slug}-{date}.md` |
| `text` | Tracker document (Meta Project) | Create document (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`) |
| `branch` | Comment on related MR if exists, else local file | Detect MR from branch, fallback to file |

The user can override via **[D]** Change destination.

### 5. Publish

**Menu handling:**

- **P**: Publish to determined destination. Execute the appropriate command. Confirm success.
- **E**: User edits the report. Re-present. Return to menu.
- **D**: User selects new destination. Update. Return to menu.
- **S**: Save report to local file only: `{project_root}/adr-review-{slug}-{date}.md`

<check if="publication fails">
  Log error. Offer fallback: save locally.
  Do NOT HALT — the review is complete, only publication failed.
</check>

Store `PUBLICATION_DESTINATION` and `PUBLICATION_REFERENCE` (URL or file path).

### 6. Update WIP

Add step 7 to `stepsCompleted`. Store publication details.

### 7. Proceed

Load, read entire file, execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Report composed from template (not ad-hoc)
- Report presented to user before publishing
- User explicitly confirmed publication
- Publication executed to correct destination

### FAILURE:

- Publishing without user confirmation
- Composing report without template
- Including rejected findings in report
- Silently failing publication without offering fallback

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Publish Review Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
