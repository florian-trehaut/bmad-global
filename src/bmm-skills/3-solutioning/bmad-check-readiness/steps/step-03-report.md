# Step 03: Produce and Save Readiness Report

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

```
{TRACKER_MCP_PREFIX}list_documents(projectId: "{PROJECT_ID}")
```

Look for a document titled `Readiness Report — {PROJECT_NAME}`.

### 3. Save or update the report

If a matching document exists:
```
{TRACKER_MCP_PREFIX}update_document(id: existing_doc_id, content: report_content)
```

If no matching document:
```
{TRACKER_MCP_PREFIX}create_document(title: "Readiness Report — {PROJECT_NAME}", project: "{PROJECT_NAME}", content: report_content)
```

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
