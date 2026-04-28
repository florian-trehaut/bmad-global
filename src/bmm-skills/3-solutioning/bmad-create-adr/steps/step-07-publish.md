---
nextStepFile: null
---

# Step 7: Publish & Return


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
CHK-STEP-07-ENTRY PASSED — entering Step 7: Publish & Return with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Write the ADR file to the project's ADR location. Handle supersession (mark old ADR as superseded). Present final summary. Return control to calling workflow if sub-workflow mode. Clean up WIP.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are the publisher — accurate file operations with user confirmation
- Never write without explicit user confirmation

### Step-Specific Rules:

- Publication requires explicit user confirmation
- Supersession must update both the old and new ADR atomically
- WIP file must be deleted after successful publication
- In sub-workflow mode, return a structured summary to the caller

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Present confirmation menu before writing
- Clean up WIP after publication

---

## MANDATORY SEQUENCE

### 1. Determine Output Path

Compose the filename based on numbering convention:

- If numbered: `{ADR_LOCATION}/{NEXT_ADR_NUMBER}-{SLUG}.md`
  - Example: `docs/decisions/0007-use-redis-for-session-cache.md`
- If unnumbered: `{ADR_LOCATION}/{SLUG}.md`

Present: "ADR will be written to: `{path}`"

### 2. Confirm Publication

> **Ready to publish:**
>
> | Field | Value |
> |-------|-------|
> | File | `{path}` |
> | Status | Proposed |
> | Format | {ADR_FORMAT} |
> | Options considered | {N} |
> | Chosen | {chosen_option_name} |
> | Self-review | {result} |
> {If SUPERSEDES_ADR:}
> | Supersedes | ADR-{N}: {title} (will be marked "Superseded") |
>
> **[P]** Publish — write the ADR file
> **[E]** Edit — go back and modify the ADR
> **[S]** Save to clipboard only — display content without writing file

WAIT for selection.

- **P**: Proceed to step 3.
- **E**: Return to step-06 compose menu.
- **S**: Display the full ADR content for manual copy. Skip file write. Proceed to step 5 (cleanup).

### 3. Write ADR File

Write the ADR content to `{path}`.

<check if="SUPERSEDES_ADR is set">
  After writing the new ADR:
  1. Read the old ADR file at `{ADR_LOCATION}/{old_filename}`
  2. Find the status field (in frontmatter or "## Status" section)
  3. Change status from current value to: `superseded by ADR-{NEXT_ADR_NUMBER}: {new_title}`
  4. Write the updated old ADR back
  5. Verify: "Updated ADR-{N} status to 'Superseded by ADR-{NEXT_ADR_NUMBER}'."
</check>

Verify the file was written successfully:
```bash
ls -la {path}
```

<check if="write fails">
  Present the full ADR content in the conversation:
  "File write failed: {error}. Here is the full ADR content for manual creation:"

  {full ADR content}

  Do NOT HALT — the ADR content is preserved in the conversation.
</check>

### 4. Verify Publication

Read back the first 5 lines of the written file to confirm:
```bash
head -5 {path}
```

### 5. Delete WIP File

```bash
rm /tmp/bmad-wip-create-adr-{SLUG}.md 2>/dev/null
```

### 6. Present Final Summary

> **ADR Created Successfully**
>
> | Field | Value |
> |-------|-------|
> | ADR | {NEXT_ADR_NUMBER}-{SLUG} |
> | Title | {title} |
> | Status | Proposed |
> | Location | `{path}` |
> | Format | {ADR_FORMAT} |
> | Options considered | {N} |
> | Chosen | {chosen_option_name} |
> | Supersedes | {ADR-N: title | none} |
> | Self-review | {N_pass} PASS, {N_concern} CONCERN |
>
> **Y-statement:** {y_statement}
>
> **Next steps:**
> - Share the ADR with the team for review
> - Once accepted by stakeholders, change status from `proposed` to `accepted`
> - To run a formal review: invoke `bmad-adr-review` on this ADR
> {If SUPERSEDES_ADR:}
> - Verify superseded ADR-{N} is correctly marked

### 7. Sub-Workflow Return

<check if="INVOCATION_MODE == 'sub-workflow'">
  > **Returning to {CALLING_WORKFLOW}.**
  >
  > ADR-{NEXT_ADR_NUMBER}: {title} has been created at `{path}`.
  > The calling workflow can reference this ADR in its output.

  The workflow ends. Control returns to the calling workflow's conversation context.
</check>

<check if="INVOCATION_MODE == 'standalone'">
  The workflow is complete. Proceed to retrospective (if applicable).
</check>

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- ADR written to correct location with correct numbering
- Superseded ADR updated (if applicable)
- Publication confirmed by user before writing
- WIP file deleted
- Summary presented with next steps
- Control returned to caller if sub-workflow

### FAILURE:

- Writing without user confirmation
- Wrong numbering or filename
- Not updating superseded ADR
- Leaving WIP file behind
- Not returning control in sub-workflow mode

---

## STEP EXIT (CHK-STEP-07-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-07-EXIT PASSED — completed Step 7: Publish & Return
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-adr executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06', '07']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05', '06', '07'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
