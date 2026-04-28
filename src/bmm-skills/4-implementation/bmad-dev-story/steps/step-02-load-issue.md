---
nextStepFile: './step-03-setup-worktree.md'
---

# Step 2: Load Issue from Tracker


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Load Issue from Tracker with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Load the selected issue details from the tracker and extract all identifiers needed for subsequent steps.

## MANDATORY SEQUENCE

### 1. Load Issue Details

Fetch the issue from the tracker (using CRUD patterns from workflow-knowledge/project.md):
- Operation: Get issue by ID
- Issue: {ISSUE_IDENTIFIER}
- Include: relations

Store:
- ISSUE_ID, ISSUE_IDENTIFIER, ISSUE_TITLE, PROJECT_NAME, PROJECT_ID
- The issue description IS the story — it contains, per the **story-spec v2 schema** (see `~/.claude/skills/bmad-shared/spec-completeness-rule.md`):
  - Definition of Done (Feature + Non-regression)
  - Problem / Proposed Solution / Scope (Included/Excluded) / **Out of Scope (OOS-N)**
  - Business Context (User Journey + BACs in Given/When/Then + External Dependencies)
  - Technical Context (in `<details>` collapsible)
  - **Real-Data Findings** (or N/A justified)
  - **External Research** (or N/A justified)
  - Data Model / API Contracts / Infrastructure / External Data Interface Contracts / Data Mapping (conditional)
  - **NFR Registry** (7 categories)
  - **Security Gate** (binary verdict)
  - **Observability Requirements** (logs / metrics / traces / alerts / dashboards / SLOs)
  - Implementation Plan (Tasks + TACs in EARS notation)
  - Guardrails
  - Validation Metier (VM-N)
  - **Boundaries Triple** (Always Do / Ask First / Never Do)
  - **Risks & Assumptions Register**
  - **INVEST Self-Check**
  - Test Strategy
  - File List

Tolerant parsing: missing optional sections are noted but do NOT halt the workflow. Missing mandatory sections (per spec-completeness-rule.md) → HALT and prompt user to either fix the spec or grant explicit waiver.

### 2. Derive Names

- ISSUE_NUMBER: from ISSUE_IDENTIFIER using `{ISSUE_PREFIX}` (e.g., PRJ-48 -> 48)
- SHORT_DESCRIPTION: from ISSUE_TITLE (slugified, max 30 chars)

### 3. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: All identifiers extracted, issue description stored
### FAILURE: Missing identifiers, not storing issue description

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Load Issue from Tracker
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
