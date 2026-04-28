# Step 2: Classify, Detect Risks, and Present Report


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
CHK-STEP-02-ENTRY PASSED — entering Step 2: Classify, Detect Risks, and Present Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Process the raw tracker data from step 1 into a structured sprint status report. Classify issues by status, group by project (epic), detect risks, recommend the next action, and present the complete report to the user.

## RULES

- **ABSOLUTELY NO TIME ESTIMATES** — never mention hours, days, weeks, durations, velocity, or remaining effort
- Present facts and counts only — no opinions on team performance
- All communication in `{COMMUNICATION_LANGUAGE}`
- Sort issues by project first, then by issue identifier
- Risks must be specific: include the issue identifier and title

## SEQUENCE

### 1. Classify issues by status

For each issue in `ALL_ISSUES`, classify into one of these statuses based on the issue's current state:

| Status | Meaning |
|--------|---------|
| **Backlog** | Not yet ready for development |
| **Todo** | Ready for development |
| **In Progress** | Currently being worked on |
| **In Review** | MR submitted, awaiting peer review |
| **To Test** | MR merged, awaiting validation metier |
| **Done** | Validated and complete |
| **Blocked** | Cannot proceed |
| **Canceled** | Will not be done |

### 2. Separate cycle vs non-cycle issues

Split the classified issues into two groups:
- **Cycle issues** — assigned to the current cycle (`CYCLE_ID`)
- **Non-cycle issues** — no cycle assigned or assigned to a different cycle

### 3. Group by project (epic)

For each cycle issue, associate it with its project (epic) from `ALL_PROJECTS`. Issues without a project go into an "Unassigned" group.

For each project, count:
- Total issues in the current cycle
- Issues done in the current cycle

### 4. Detect risks

Scan cycle issues for the following risk patterns:

| Risk | Condition | Report format |
|------|-----------|---------------|
| Blocked issue | Any issue with status Blocked | Issue identifier + title |
| Empty cycle | Current cycle has 0 issues | Warning |
| Empty pipeline | A project has In Progress issues but 0 Todo issues | Project name |
| Cycle ending soon | `CYCLE_END` is within 3 calendar days from today | Warning with end date |

Store all detected risks in `RISKS`.

### 5. Select next action recommendation

From the current cycle issues, determine the recommended next workflow using this priority:

1. If any issue is **In Progress** → recommend `dev-story` for the first in-progress issue (sorted by project, then identifier)
2. Else if any issue is **In Review** → recommend `code-review` for the first review issue
3. Else if any issue is **Todo** → recommend `dev-story` for the first todo issue
4. Else if any issue is **Backlog** (in cycle) → recommend `create-story` for the first backlog issue
5. Else → all cycle items are done or canceled

Store: `NEXT_ISSUE_IDENTIFIER`, `NEXT_ISSUE_TITLE`, `NEXT_WORKFLOW`.

### 6. Present the report

Display the full sprint status report:

```
## Sprint Status

- **Cycle**: {CYCLE_NAME} ({CYCLE_START} → {CYCLE_END})
- **Team**: {TRACKER_TEAM}
- **Source**: Tracker (live)

### Current Cycle Issues

| Status      | Count |
| ----------- | ----- |
| Backlog     | {n}   |
| Todo        | {n}   |
| In Progress | {n}   |
| In Review   | {n}   |
| To Test     | {n}   |
| Blocked     | {n}   |
| Done        | {n}   |
| Canceled    | {n}   |

### By Project (Epic)

**{project_name}**: {issue_count} issues ({done_count} done)
  - {identifier}: {title} [{status}]
  ...

### Recommendation

Next: `/{NEXT_WORKFLOW}` — {NEXT_ISSUE_IDENTIFIER}: {NEXT_ISSUE_TITLE}

### Risks (if any)

- {risk description}
```

### 7. CHECKPOINT — Offer actions

Present the user with choices:

1. Launch the recommended workflow
2. Show all issues grouped by status (full detail)
3. Show all issues grouped by project (full detail)
4. Exit

WAIT for user selection.

**If choice 1:** Tell the user which workflow to invoke and with which issue identifier.
**If choice 2:** Display all cycle issues grouped by status, with identifier, title, and project for each.
**If choice 3:** Display all cycle issues grouped by project, with identifier, title, and status for each.
**If choice 4:** End the workflow.

---

## END OF WORKFLOW

The bmad-sprint-status workflow is complete.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Classify, Detect Risks, and Present Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-sprint-status executed end-to-end:
  steps_executed: ['01', '02']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
