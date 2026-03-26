# Step 4: Compile and Save Test Design

## STEP GOAL

Compose the complete Test Design document(s) in Markdown and save to the tracker. In system-level mode, produce two separate documents (Architecture + QA). In epic-level mode, produce a single document.

## RULES

- The document must be self-contained — readable without access to the workflow state
- Use `{COMMUNICATION_LANGUAGE}` for all document content
- Epic-level documents are saved in the Epic's Project; system-level documents in the Meta Project
- Check for an existing "Test Design" document before creating a new one — update if it exists

## SEQUENCE

### 1. Compose the document(s)

**System-level mode — produce TWO documents:**

**Document 1: Test Design Architecture** (for dev/architecture teams)

Title: `Test Design: Architecture — {project name or 'System'}`

Content focuses on what the architecture/dev team needs to act on:

```markdown
# Test Design for Architecture — {project name or 'System'}

**Date:** {current date}
**Auteur:** {USER_NAME}
**Status:** Architecture Review Pending

## Synthèse

- **Risques identifiés:** {RISK_COUNT} ({HIGH_RISK_COUNT} avec score >= 6)
- **Tests planifiés:** {TOTAL_TEST_COUNT}

## Quick Guide

### Blockers — L'équipe doit décider (ne peut pas avancer sans)
{Sprint 0 critical path items that must be resolved before QA can write tests}

### Haute priorité — L'équipe doit valider
{Recommendations that need team approval}

### Info — Solutions fournies
{Test strategy, tooling, coverage summary — review only}

## Matrice des risques
{Full risk assessment table from step 2, organized by severity}

## Revue de testabilité
{Testability assessment from step 2 — concerns, strengths, ASRs}

## Plans de mitigation (risques >= 6)
{Detailed mitigation strategies for high-priority risks}

## Hypothèses et dépendances
{Assumptions, dependencies, risks to the plan itself}
```

**Document 2: Test Design QA** (for QA team)

Title: `Test Design: QA — {project name or 'System'}`

Content focuses on what QA needs to execute:

```markdown
# Test Design for QA — {project name or 'System'}

**Date:** {current date}
**Auteur:** {USER_NAME}

## Synthèse

- **Risques:** {RISK_COUNT} ({HIGH_RISK_COUNT} score >= 6)
- **Tests:** P0: {P0_COUNT}, P1: {P1_COUNT}, P2: {P2_COUNT}, P3: {P3_COUNT} — Total: {TOTAL_TEST_COUNT}

## Hors périmètre
{Components explicitly excluded from this test plan, with rationale}

## Dépendances et blockers
{What QA needs from other teams before testing can begin}

## Plan de couverture
{Coverage plan table from step 3 — P0 through P3 with test types}

## Scénarios Journey
{Journey scenarios if any}

## Stratégie d'exécution
{Execution tiers: every PR / nightly / weekly / manual}

## Estimation effort QA
{Effort estimates per priority level}

## Critères d'entrée / sortie
{Entry and exit criteria}

## Critères de qualité (Quality Gate)
{Quality gate criteria from step 3}
```

**Epic-level mode — produce ONE document:**

Title: `Test Design — {project name}`

```markdown
# Test Design — {project name}

**Date:** {current date}
**Mode:** {MODE}
**Auteur:** {USER_NAME}

## Synthèse

- **Risques identifiés:** {RISK_COUNT} ({HIGH_RISK_COUNT} avec score >= 6)
- **Tests planifiés:** {TOTAL_TEST_COUNT} (P0: {P0_COUNT}, P1: {P1_COUNT}, P2: {P2_COUNT}, P3: {P3_COUNT})

## Matrice des risques

{Full risk assessment table from step 2}

## Plan de couverture

{Coverage plan table from step 3}

## Scénarios Journey

{Journey scenarios if any, or "Aucun scénario journey identifié."}

## Ordre d'exécution

1. Smoke tests
2. P0 — {summary}
3. P1 — {summary}
4. P2/P3 — {summary}

## Critères de qualité (Quality Gate)

{Quality gate criteria from step 3}

## Critères d'entrée / sortie

**Entrée:**
{Entry criteria}

**Sortie:**
{Exit criteria}

## Recommandations

{Actionable recommendations based on the analysis — infrastructure needs, missing test tooling, risks requiring architectural changes, etc.}
```

### 2. Save to the tracker

**Epic-level mode:**

1. Check for an existing "Test Design" document in the project (using CRUD patterns from tracker.md):
   - Operation: List documents
   - Project: PROJECT_ID
   Search for a document with "Test Design" in the title.

2. If found — update it (using CRUD patterns from tracker.md):
   - Operation: Update document
   - Document: EXISTING_DOC_ID
   - Content: composed_content

3. If not found — create it (using CRUD patterns from tracker.md):
   - Operation: Create document
   - Title: "Test Design"
   - Project: PROJECT_ID
   - Content: composed_content

**System-level mode:**

Save both documents separately:

1. Check for existing documents in the Meta Project (using CRUD patterns from tracker.md):
   - Operation: List documents
   - Project: {TRACKER_META_PROJECT_ID}

2. For the Architecture document — search for "Test Design: Architecture". Update if found, create if not:
   - Operation: Create/Update document
   - Title: "Test Design: Architecture"
   - Project: {TRACKER_META_PROJECT_ID}
   - Content: architecture_content

3. For the QA document — search for "Test Design: QA". Update if found, create if not:
   - Operation: Create/Update document
   - Title: "Test Design: QA"
   - Project: {TRACKER_META_PROJECT_ID}
   - Content: qa_content

### 3. Report completion

Present to the user:

> ## Test Design saved
>
> - **Mode**: {MODE}
> - **Target**: {project name or 'System'}
> - **Risks**: {RISK_COUNT} identified ({HIGH_RISK_COUNT} critical)
> - **Tests planned**: {TOTAL_TEST_COUNT}
> - **Tracker document(s)**: saved ({created or updated})
>   {If system-level: list both document titles}

---

## END OF WORKFLOW

The bmad-test-design workflow is complete.
