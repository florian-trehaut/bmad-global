# Step 1: Intake


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 1: Intake with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Identify the issue to validate (provided by the user or discovered via tracker), verify it is in the correct status for validation, extract the Validation Metier (VM) and Definition of Done (DoD) sections.

## RULES

- Load `~/.claude/skills/bmad-shared/validation-intake-protocol.md` and apply its protocol as baseline rules for this step
- HALT if the issue is not in the "to test" status (using `TRACKER_STATES.to_test`)
- HALT if the VM and DoD sections are absent (propose to infer ONLY with explicit user authorization)
- NEVER invent VM items — they come from the issue or the user
- NEVER auto-select an issue without user confirmation

## SEQUENCE

### 1. Obtain the issue identifier

**If the user provided an identifier (e.g., {ISSUE_PREFIX}-XXX)** — store `ISSUE_IDENTIFIER`, proceed to step 2.

**If no identifier provided** — launch discovery:

#### 1a. Discover issues in "To Test" status

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Status: {TRACKER_STATES.to_test}
- Limit: 20

Store results in `TO_TEST_CANDIDATES[]`.

#### 1b. Present selection

If no candidates:
"No issues in 'To Test' status found in team {TRACKER_TEAM}. Nothing to validate."
End of workflow.

If candidates found, present:

```
## Issues awaiting business validation

| #   | Issue        | Title                          | Assignee      |
| --- | ------------ | ------------------------------ | ------------- |
| 1   | {PREFIX}-XXX | ...                            | ...           |
| 2   | {PREFIX}-YYY | ...                            | ...           |

Which issue do you want to validate?
```

WAIT for user selection.

Store `ISSUE_IDENTIFIER`.

### 2. Load the issue from tracker

Fetch the issue from the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Get issue
- Identifier: ISSUE_IDENTIFIER

Verify:
- **Status = "To Test"** (matching `TRACKER_STATES.to_test`) — if different status, HALT: "Issue {ISSUE_IDENTIFIER} is in status '{status}', not in 'To Test'. Business validation only applies to issues in 'To Test'."

Store `ISSUE_ID`, `ISSUE_TITLE`, `ISSUE_DESCRIPTION`.

### 3. Parse the VM and DoD sections

Search in `ISSUE_DESCRIPTION`:

**Definition of Done (product)** — section starting with a heading containing "Definition of Done" or "DoD".

**Validation Metier** — section starting with a heading containing "Validation Metier", "Validation Métier", or "VM". Each item starts with `VM-N` or a checkbox `- [ ]`.

### 4. Verify section presence

**If both sections are present:**
- Parse each VM into a structured list: `[{id, description, bac_refs}]`
- Parse the DoD into a list of criteria
- Display: "Issue **{ISSUE_IDENTIFIER}** — {ISSUE_TITLE}"
- Display the number of VM items found and their list
- Continue to step 5

**If one or both sections are absent:**
- HALT: "Issue **{ISSUE_IDENTIFIER}** does not contain a {missing_section} section."
- Ask: "Should I try to infer validation items from the issue content? [Y]es / [N]o"
- If Yes — analyze the issue, propose inferred VM items, wait for user validation
- If No — HALT: "Cannot continue without Validation Metier. Add the sections to the issue and re-launch."

### 5. Ask for environment

"Which environment should I validate against? **[D]ev server** (default) / **[S]taging** / **[P]roduction**"

- If no response or 'D' — `ENVIRONMENT = dev_server`
- If 'S' — `ENVIRONMENT = staging`
- If 'P' — `ENVIRONMENT = production`, remind: "Production mode: every write action will require your explicit authorization."

Store `ENVIRONMENT`.

### 6. CHECKPOINT

Present the parsed VM items to the user:

```
## Validation Plan

**Issue:** {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
**Environment:** {ENVIRONMENT}
**VM items to validate:** {count}

{numbered list of VM items with descriptions}

Proceed with validation?
```

WAIT for user confirmation.

### 7. Proceed

Load and execute `./steps/step-02-preflight.md`.

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Intake
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
