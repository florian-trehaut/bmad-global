---
nextStepFile: './step-05-review-phase.md'
---

# Step 4: Team Create — TeamCreate + Pre-Spawn Validation (TAC-28)

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-03-EXIT emis (ISSUE_ID and SPEC_PATH set)
- [ ] Variables en scope: TEAM_MODE, ISSUE_ID, SPEC_PATH, WORKTREE_PATH, dev_team_size, code_review_team_size

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Team Create with TEAM_MODE={value}, ISSUE_ID={id}
```

## STEP GOAL

If TEAM_MODE=true: call `TeamCreate` to provision the team that will host phases 2-5 teammates. Validate every spawn pre-condition (TAC-28: `task_contract.input_artifacts.tracker_issue.identifier` non-null).

If TEAM_MODE=false: skip TeamCreate entirely (sequential inline mode per BAC-9). Set `TEAM_NAME = null` and proceed.

## MANDATORY SEQUENCE

### 1. Branch on TEAM_MODE

#### TEAM_MODE=false (BAC-9 / TAC-12 fallback)

```
Skip TeamCreate.
Set TEAM_NAME = null.
Set LEAD_NAME = "lead" (placeholder — not used in fallback mode since SendMessage is replaced by inline calls).
Proceed to step-05 with the understanding that step-05/06/07/08 will execute their phase logic inline (no TaskCreate, no Agent Teams calls).
```

#### TEAM_MODE=true (normal path)

Continue to §2.

### 2. Build the TeamCreate payload

Read `team-workflows/team-config.md` (the team configuration). Substitute `{ISO_DATE}` and `{slug}`:

```yaml
TEAM_NAME = 'auto-flow-' + ISO_DATE_TODAY + '-' + SLUG_FROM_STEP_01
```

Build:

```yaml
team:
  name: '{TEAM_NAME}'
  description: 'BMAD auto-flow lifecycle for {ISSUE_ID}: {ISSUE_TITLE}'
  lead_persona: |
    {COMMUNICATION_LANGUAGE}-speaking lead orchestrating a 5-phase BMAD lifecycle. Coordinates 4 phases (review, dev, code-review, validation) via Agent Teams. Routes teammate questions to the user via batched AskUserQuestion. Handles phase failures with [R]/[F]/[A] menu. Sole writer of tracker state.
  member_personas:
    {one entry per role from team-config.md, with knowledge_files from agent_teams.knowledge_mapping}
```

### 3. Call TeamCreate

```
Invoke the TeamCreate tool with the payload above.
```

If TeamCreate returns an error → HALT (cannot proceed without a team). Display error to user and offer:

```
[R] Retry TeamCreate
[A] Abandon
```

On retry → loop. On abandon → proceed to step-09 (TeamDelete is a no-op in this case).

### 4. Pre-spawn validation (TAC-28 — applies to ALL subsequent TaskCreate calls)

Establish the validation gate that step-05 / 06 / 07 / 08 will use before each TaskCreate:

```
Pre-spawn assertion (run before EVERY TaskCreate downstream):

assert ISSUE_ID is not None
assert ISSUE_ID matches the tracker pattern (issue_prefix + '-' + N for trackers; kebab-slug for file-based)
assert WORKTREE_PATH is set (either to a real worktree or to MAIN_PROJECT_ROOT identity)

On failure → HALT with TAC-28 message:
"task_contract.input_artifacts.tracker_issue.identifier is null/missing/malformed when spawning the {role} teammate. Orchestrator HALT before spawning."
```

Document this gate as a reusable assertion. Each subsequent step file references TAC-28 and applies the gate.

### 5. Initialize message queue

Per `data/question-routing.md`:

```
QUESTION_BUFFER = []
BUFFER_FIRST_TIMESTAMP = null
MESSAGE_QUEUE = []
PENDING_QUESTION_REPLIES = {}
PHASE_RESULTS = {}
```

### 6. Audit log

If audit_log_enabled:

```bash
echo "[step-04-team-create] TEAM_NAME={name} | members={list of roles}" >> $LOG_FILE
```

### 7. Proceed

Load and execute `{nextStepFile}`.

## SUCCESS / FAILURE

- **SUCCESS**: TeamCreate succeeded (or skipped in TEAM_MODE=false), TEAM_NAME and LEAD_NAME set, pre-spawn validation gate documented
- **FAILURE**: skipping pre-spawn validation, calling TeamCreate with invalid ISSUE_ID, proceeding without LEAD_NAME

---

## STEP EXIT (CHK-STEP-04-EXIT)

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Team Create
  actions_executed: TeamCreate {invoked → TEAM_NAME={name} | skipped (TEAM_MODE=false)}; pre-spawn validation gate established (TAC-28); message queue initialized
  artifacts_produced: TEAM_NAME, LEAD_NAME, MESSAGE_QUEUE=[], PENDING_QUESTION_REPLIES={}, PHASE_RESULTS={}
  next_step: ./steps/step-05-review-phase.md
```

**Next:** Read FULLY and apply: `./steps/step-05-review-phase.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
