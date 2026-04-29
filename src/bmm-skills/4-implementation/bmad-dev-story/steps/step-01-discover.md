---
nextStepFile: './step-02-load-issue.md'
mrAttentionFlags: '../data/mr-attention-flags.md'
---

# Step 1: Discover Actionable Work


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
CHK-STEP-01-ENTRY PASSED — entering Step 1: Discover Actionable Work with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Collect all actionable candidates — tracker issues (In Progress / Todo) and forge MRs needing attention — then present a unified selection menu to the user.

## TEAMMATE_MODE branch

Per `~/.claude/skills/bmad-shared/teammate-mode-routing.md`, when TEAMMATE_MODE=true and ORCH_AUTHORIZED=true:

- **Skip discovery and user selection** entirely.
- Read `ISSUE_IDENTIFIER` from `task_contract.input_artifacts[].identifier` (filter to type=`tracker_issue`).
- HALT (TAC-28) if missing/null/malformed: `task_contract.input_artifacts.tracker_issue.identifier is null/missing/malformed when spawning the teammate`.
- Skip the unified selection menu. Proceed directly to `{nextStepFile}` Step 2.

When TEAMMATE_MODE=false, proceed with the Mandatory Sequence below.

## MANDATORY EXECUTION RULES:

- Execute ALL steps in exact order — NO skipping
- NEVER stop for "milestones" or "session boundaries" — continue until COMPLETE or HALT
- Communicate in {COMMUNICATION_LANGUAGE} with {USER_NAME}

## MANDATORY SEQUENCE

### 1. Check for Pre-Selected Issue

<check if="issue_identifier is provided and not empty">
  <action>Use provided identifier — skip discovery, go directly to {nextStepFile} Step 2</action>
</check>

### 2. Collect Tracker Candidates

Query the tracker (using CRUD patterns from workflow-knowledge/project.md):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Status: {TRACKER_STATES.in_progress}
- Assigned to: me
- Limit: 10

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: {TRACKER_TEAM}
- Status: {TRACKER_STATES.todo}
- Assigned to: me
- Limit: 10

Store all found issues as TRACKER_CANDIDATES[].

### 3. Collect Forge MR Candidates

```bash
# Determine current forge user
FORGE_USER=$({FORGE_API_BASE} user | jq -r '.username')
PROJECT_ID=$({FORGE_API_BASE} "projects/{FORGE_PROJECT_PATH_ENCODED}" | jq -r '.id')
{FORGE_API_BASE} "projects/$PROJECT_ID/merge_requests?state=opened&author_username=$FORGE_USER&per_page=50" \
  | jq -r '.[] | "\(.iid)|\(.title)|\(.source_branch)|\(.detailed_merge_status)"'
```

IMPORTANT: Never use `2>/dev/null` on forge CLI commands — errors must be visible.

For EACH MR, analyze threads using the logic from {mrAttentionFlags}.

Store MRs with at least ONE actionable attention flag as MR_CANDIDATES[].

### 4. Present Unified Selection

<check if="no TRACKER_CANDIDATES and no MR_CANDIDATES">
  <output>No actionable work found. Create a new story in the tracker first.</output>
  <action>Exit workflow</action>
</check>

Present all options in a single numbered list, MRs needing attention first:

```
## What would you like to work on?

### MRs needing attention
| #   | MR     | Title                  | Attention required |
| --- | ------ | ---------------------- | ------------------ |

### Tracker issues
| #   | Status      | Issue        | Title                  |
| --- | ----------- | ------------ | ---------------------- |
```

WAIT for user selection.

### 5. Route Based on Selection

<check if="user selects a MR_CANDIDATE with needs_reply">
  <action>Handle MR comments for the selected MR</action>
  <action>After handling completes, return to Step 1 to re-discover work</action>
</check>

<check if="user selects a MR_CANDIDATE with only CI/rebase/conflicts flags">
  <action>Identify linked tracker issue from branch name or MR description</action>
  <action>Setup worktree for this branch and fix the issue</action>
</check>

<check if="user selects a TRACKER_CANDIDATE">
  <action>Proceed to {nextStepFile}</action>
</check>

## SUCCESS/FAILURE:

### SUCCESS: All candidates collected, user selected work item
### FAILURE: Auto-selecting without user input, hiding errors

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 1: Discover Actionable Work
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
