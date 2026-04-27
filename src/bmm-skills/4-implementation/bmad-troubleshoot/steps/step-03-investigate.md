# Step 3: Investigate

## STEP GOAL

Aggressively investigate the bug — logs, database, code, deployments — without asking the user. Launch parallel investigations via subagents when available. This is the autonomous phase.

## RULES

- **ACT, don't ask** — the user described the symptom in step 1, that is your mandate
- **READ-ONLY** — all DB access is read-only, no file modifications in the worktree
- **Use local skills** — invoke project skills from `LOCAL_SKILLS` (discovered in step 2)
- **NEVER fabricate evidence** — if a source is inaccessible, report it, don't substitute
- **Parallel when possible** — launch subagent investigations concurrently

## SEQUENCE

### 1. Load methodology and investigation checklist

Read `../data/troubleshooting-methodology.md`.

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` exists at project root, read it for domain-specific investigation patterns.

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` exists at project root, read it for stack-specific debugging context.

### 2. Launch parallel investigations

**If subagent/subprocess tools are available**, launch three investigations in parallel using the subagent workflow files. Each subagent receives its specific input and returns a structured summary.

- **Logs investigation** — `../subagent-workflows/investigate-logs.md`
  Input: `AFFECTED_SERVICE`, `TARGET_ENV`, `SYMPTOM`, `INFRA_CONTEXT`, `LOCAL_SKILLS`

- **Data investigation** — `../subagent-workflows/investigate-data.md`
  Input: `AFFECTED_SERVICE`, `TARGET_ENV`, `SYMPTOM`, `LOCAL_SKILLS`, investigation patterns from checklist

- **Code investigation** — `../subagent-workflows/investigate-code.md`
  Input: `WORKTREE_PATH`, `AFFECTED_SERVICE`, `SYMPTOM`, error patterns (empty if logs not yet available)

**If subagents are NOT available**, execute sequentially in this order:

#### 2a. Investigate logs

Follow the log reading protocol from methodology:

1. Determine log access method from `INFRA_CONTEXT` and `LOCAL_SKILLS`
2. Set time window: symptom timestamp minus 15 minutes
3. Filter: ERROR/FATAL on `AFFECTED_SERVICE`
4. Find the FIRST error occurrence
5. Extract stack trace and correlation ID
6. Find last successful log line before failure

Store findings as `LOG_EVIDENCE`.

#### 2b. Investigate data

1. Identify the DB access skill from `LOCAL_SKILLS`
2. Connect to `{TARGET_ENV}` database — READ-ONLY
3. Run diagnostic queries based on the symptom:
   - Records around the incident timestamp
   - Records in abnormal states
   - Integrity checks for inconsistent data
4. If `investigation-checklist.md` has domain-specific queries for the affected service, run those too

Store findings as `DB_EVIDENCE`.

#### 2c. Investigate code

Working inside `{WORKTREE_PATH}`:

1. Search for error patterns from log evidence (if available)
2. Trace the execution path from entry point to error
3. Check `git log --oneline -20 -- {affected_files}` for recent changes
4. Check test coverage of the buggy code path
5. Search for similar patterns elsewhere in the codebase

Store findings as `CODE_EVIDENCE`.

### 3. Check deployment correlation

Using `DEPLOY_CONTEXT` from step 2:

- Was a deploy within the symptom's time window?
- If yes: `git log --oneline {prev_deploy_hash}..{current_deploy_hash} -- {affected_files}`
- Flag files changed in the deploy that match the affected code path

Store as `DEPLOY_EVIDENCE`.

### 4. Compile all evidence

Assemble `ALL_EVIDENCE`:

```
LOG_EVIDENCE: {summary}
DB_EVIDENCE: {summary}
CODE_EVIDENCE: {summary}
DEPLOY_EVIDENCE: {summary}
```

Flag any investigation axis that could not be executed (no log access, no DB access, etc.).

### 5. Auto-proceed

Evidence collected. Proceed to diagnosis.

---

**Next:** Read fully and follow `./steps/step-04-diagnose.md`
