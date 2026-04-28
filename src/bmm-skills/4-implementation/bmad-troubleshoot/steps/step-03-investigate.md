# Step 3: Investigate

## STEP GOAL

Aggressively investigate the bug — logs, database, code, deployments — without asking the user. Launch parallel investigations via subagents when available. This is the autonomous phase. **Climb the Reproduction Hierarchy** defined in `~/.claude/skills/bmad-shared/evidence-based-debugging.md` as far as possible — rung 1 (local reproduction via test) is the target for any deterministic bug.

## RULES

- **ACT, don't ask** — the user described the symptom in step 1, that is your mandate
- **READ-ONLY** — all DB access is read-only, no file modifications in the worktree
- **Use local skills** — invoke project skills from `LOCAL_SKILLS` (discovered in step 2)
- **NEVER fabricate evidence** — if a source is inaccessible, report it, don't substitute
- **Parallel when possible** — launch subagent investigations concurrently
- **Evidence-based mandate** — apply `~/.claude/skills/bmad-shared/evidence-based-debugging.md`:
  - Code reading is **never** proof on its own — it identifies WHERE to look, never WHAT happened
  - Attempt rung-1 reproduction (local test that fails at the baseline commit) for every deterministic bug
  - If rung 1 is unreachable, document which exception class (E-1 to E-8) applies and climb to the highest rung that IS reachable

## SEQUENCE

### 1. Load methodology and investigation checklist

Read `../data/troubleshooting-methodology.md`.

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing) for domain-specific investigation patterns.

Read `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (HALT if missing) for stack-specific debugging context.

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
4. If `project.md#investigation-checklist` has domain-specific queries for the affected service, run those too

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

### 5. Determine reproduction rung achieved

Per `~/.claude/skills/bmad-shared/evidence-based-debugging.md`, classify the highest evidence rung obtained for the bug:

- **Rung 1** — local reproduction via automated test (deterministic). Capture pre-fix failure output now, even if the fix is not yet implemented (the test exists and fails at baseline)
- **Rung 2** — local reproduction via manual run (deterministic but no test artifact yet — must be promoted to rung 1 in step-06)
- **Rung 3** — captured production artifact (log line + correlation ID, DB snapshot, stack trace) — record the exception class E-1 to E-8 that justifies why rung 1-2 are unreachable
- **Rung 4** — live production observation (note the screenshot/copy made for durability)
- **Rung 5** — user report only (acceptable as starting point, but cannot be the final proof — must be promoted before step-06)

Store as `EVIDENCE_RUNG` and (if applicable) `EVIDENCE_EXCEPTION_CLASS`. The diagnosis report in step-04 will cite these.

If `EVIDENCE_RUNG` is 5 (user report only) and no exception class applies, **HALT**: "Cannot diagnose with rung-5 evidence alone. Investigate further: try local reproduction (rung 1-2), or capture a production artifact (rung 3). Re-run step-03 once you have a higher-rung artifact."

### 6. Auto-proceed

Evidence collected and rung classified. Proceed to diagnosis.

---

**Next:** Read FULLY and apply: `./steps/step-04-diagnose.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
