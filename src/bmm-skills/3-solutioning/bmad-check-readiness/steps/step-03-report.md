# Step 03: Produce and Save Readiness Report


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
CHK-STEP-03-ENTRY PASSED — entering Step 03: Produce and Save Readiness Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Compile all findings into a formal readiness report and save it as a tracker Document in the project. Present the final verdict to the user with actionable next steps.

## RULES

- The report must be self-contained — readable without access to the original artifacts
- HALT on tracker write failure — never silently fallback
- Check for an existing readiness report before creating (update if exists)
- The verdict (GO / CONDITIONAL GO / NO-GO) must be prominently displayed

## SEQUENCE

### 1. Compose the readiness report

Build the report with this structure:

```markdown
# Implementation Readiness Report — {PROJECT_NAME}

**Date:** {current_date}
**Verdict:** {VERDICT}
**Reviewer:** Claude (adversarial readiness review)

---

## Executive Summary

{2-3 sentence summary of the overall readiness state, highlighting the most critical findings.}

---

## Artifact Inventory

| Artifact | Status | Document |
|----------|--------|----------|
| PRD | Found / Missing | {title} |
| Architecture | Found / Missing | {title} |
| UX Design | Found / Missing / N/A | {title} |
| Stories | {count} total, {count} with ACs | — |

---

## Validation Results

### PRD Completeness — {COMPLETE/PARTIAL/ABSTRACT}

{Detailed findings per section, with evidence.}

### Architecture Completeness — {COMPLETE/PARTIAL/ABSTRACT}

{Detailed findings per section, with evidence.}

### UX Design — {COMPLETE/PARTIAL/ABSTRACT/N/A}

{Detailed findings if applicable.}

### Data Model Concreteness — {COMPLETE/PARTIAL/ABSTRACT}

{Are there concrete table definitions? Or only abstract statements?}

### API Contracts — {COMPLETE/PARTIAL/ABSTRACT}

{Are endpoints defined with payloads and error codes? Or only "REST API"?}

### Infrastructure Plan — {COMPLETE/PARTIAL/ABSTRACT}

{Are cloud resources explicitly planned? Or only "deployed on GCP"?}

### Requirements Traceability — {COMPLETE/PARTIAL/ABSTRACT}

{Traceability matrix summary. List uncovered requirements.}

### Story Quality — {COMPLETE/PARTIAL/ABSTRACT}

{Quality assessment of acceptance criteria.}

---

## Gaps Summary

### Blocking Gaps (require resolution before development)

{Numbered list of ABSTRACT findings and missing artifacts.}

### Non-Blocking Gaps (should be resolved but development can start)

{Numbered list of PARTIAL findings.}

---

## Verdict: {VERDICT}

{Verdict justification — why GO, CONDITIONAL GO, or NO-GO.}

### Recommended Next Steps

{Actionable items based on the verdict:
- For GO: proceed to sprint planning
- For CONDITIONAL GO: list items to resolve in parallel with early development
- For NO-GO: list items that must be completed before re-running readiness check}
```

### 2. Check for existing readiness report

Search for an existing readiness report in the project:

List documents in the project (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {PROJECT_ID}

Look for a document titled `Readiness Report — {PROJECT_NAME}`.

### 3. Save or update the report

If a matching document exists, update it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update document
- Document: existing_doc_id
- Content: report_content

If no matching document, create it in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create document
- Title: "Readiness Report — {PROJECT_NAME}"
- Project: {PROJECT_NAME}
- Content: report_content

If the tracker write fails: **HALT** — report the error to the user. The report content is still available in the conversation.

### 4. Report completion

Present the final summary to the user:

If `{VERDICT}` is GO:
```
Readiness check terminé — {PROJECT_NAME}

Verdict: GO
Rapport sauvegardé dans le projet.

Tous les prérequis sont satisfaits. Le développement peut démarrer.
Prochaine étape : sprint planning.
```

If `{VERDICT}` is CONDITIONAL GO:
```
Readiness check terminé — {PROJECT_NAME}

Verdict: CONDITIONAL GO
Rapport sauvegardé dans le projet.

Le développement peut démarrer avec des réserves. Gaps à résoudre en parallèle :
{list of PARTIAL gaps}
```

If `{VERDICT}` is NO-GO:
```
Readiness check terminé — {PROJECT_NAME}

Verdict: NO-GO
Rapport sauvegardé dans le projet.

Des lacunes bloquantes ont été identifiées :
{list of ABSTRACT gaps}

Corrigez ces lacunes puis relancez le readiness check.
```

---

## END OF WORKFLOW

The bmad-check-readiness workflow is complete.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 03: Produce and Save Readiness Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-check-readiness executed end-to-end:
  steps_executed: ['01', '02', '03']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
