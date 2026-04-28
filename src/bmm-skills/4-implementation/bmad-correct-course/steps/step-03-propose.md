# Step 3: Propose Corrective Actions


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
CHK-STEP-03-ENTRY PASSED — entering Step 3: Propose Corrective Actions with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Draft specific corrective proposals based on the approved impact analysis. Present all proposals in Plan mode for user validation before any tracker mutations.

## RULES

- Enter Plan mode before presenting proposals
- Each proposal must have a clear Old/New comparison or a concrete specification
- In incremental mode, present each proposal individually for discussion
- In batch mode, present all proposals at once
- Do NOT execute any tracker changes — that happens in step 4
- New stories must include title, description, and acceptance criteria
- Modifications must specify exactly what changes in the existing issue

## SEQUENCE

### 1. Draft story changes

For each category from the approved assessment, draft specific proposals:

**Stories to modify:**

For each issue identified in step 2:
- **Issue:** {identifier} — {current title}
- **What changes:** {specific edits to description, acceptance criteria, or scope}
- **Reason:** {why this change is needed}

**New stories to create:**

For each new issue identified in step 2:
- **Title:** {proposed title}
- **Description:** {proposed description with context}
- **Acceptance Criteria:** {at minimum 2-3 clear criteria}
- **Target project:** {which epic/project this belongs to}
- **Priority:** {suggested priority based on urgency}

**Stories to cancel:**

For each issue to cancel:
- **Issue:** {identifier} — {current title}
- **Reason:** {why it should be canceled}
- **Comment to add:** {explanation to leave on the canceled issue}

### 2. Draft document changes (if applicable)

If the assessment identified PRD, architecture, or UX document updates:

- **Document:** {document name/location}
- **Section:** {which section needs updating}
- **Old:** {current content summary}
- **New:** {proposed content summary}
- **Reason:** {why this update is needed}

### 3. Determine recommended approach

Based on the scope classification, recommend an approach:

- **Minor (adjustment):** Apply changes directly, dev team continues with updated stories
- **Moderate (backlog reorganization):** Apply changes, reorganize the backlog, possibly defer some items to next cycle
- **Major (replan):** Apply critical changes, flag for a broader replanning session (PRD/Architecture review)

### 4. CHECKPOINT — Plan mode validation

Present the complete change plan to {USER_NAME}:

```
## Course Correction Plan

### Recommended Approach: {approach_type} ({SCOPE_CLASSIFICATION})

{recommendation_summary}

### Story Modifications ({count})
{list each modification with identifier, old/new, reason}

### New Stories ({count})
{list each new story with title, description, AC, target project}

### Stories to Cancel ({count})
{list each cancellation with identifier, reason}

### Document Updates ({count})
{list each document change if any}

---
Approve this plan to proceed with tracker updates?
Modify specific proposals?
Abort the course correction?
```

WAIT for user decision.

- If **approved**: proceed to step 4
- If **modifications requested**: update the relevant proposals and re-present
- If **aborted**: end the workflow with a summary of the analysis performed

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Propose Corrective Actions
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-04-execute.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
