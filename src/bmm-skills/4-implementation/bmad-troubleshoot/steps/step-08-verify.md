# Step 8: Verify & Complete

## STEP GOAL

After the MR is merged and deployed, execute the validation metier items against the staging environment. Post the verdict to the tracker, update status, and clean up.

## RULES

- **Only real evidence counts** — API responses, DB queries, logs. Code analysis is NOT proof.
- **In production:** reads only, every write requires explicit user authorization
- **Binary verdict:** ALL VM pass = Done. ANY fail = stays In Review.
- VM verification is OPTIONAL in this step — the user may prefer to do it later or via the bmad-validation-metier skill

## SEQUENCE

### 1. Check deployment status

Ask user:

> The MR has been created. Options:
> **[V]** Verify now — the MR is merged and deployed to staging, let's run the VM
> **[L]** Verify later — I'll run `/bmad-validation-metier` when the deploy is done
> **[S]** Skip verification — just clean up

WAIT for user response.

- **IF L or S:** skip to step 5 (cleanup)
- **IF V:** continue below

### 2. Execute VM items

For each VM item from the tracker issue:

1. Execute the test against the real `{TARGET_ENV}` environment
2. Use `LOCAL_SKILLS` for DB access, API calls, etc.
3. Collect evidence (API response, DB query result, log entry)
4. Verdict: **PASS** (with evidence) or **FAIL** (with evidence)

```markdown
### VM Results

| # | VM Item | Verdict | Evidence |
|---|---------|---------|----------|
| VM-1 | {description} | PASS/FAIL | {evidence_summary} |
```

### 3. Determine verdict

**ALL PASS:** verdict = DONE
**ANY FAIL:** verdict = FAIL — issue stays In Review

### 4. Post results to tracker

```
{TRACKER_MCP_PREFIX}save_comment(
  issueId: '{ISSUE_ID}',
  body: '## Validation Metier Results\n\n{VM_RESULTS_TABLE}\n\n**Verdict: {VERDICT}**'
)
```

**If DONE:**
```
{TRACKER_MCP_PREFIX}save_issue(
  id: '{ISSUE_ID}',
  state: '{TRACKER_STATES.done}'
)
```

**If FAIL:**
Leave state as In Review. Report which VM items failed and why.

### 5. Cleanup worktree

```bash
cd {project-root}
git worktree remove {WORKTREE_PATH} --force 2>/dev/null || true
git branch -D troubleshoot/{AFFECTED_SERVICE}-{DATE} 2>/dev/null || true
```

Worktree cleanup failure is non-critical — warn but do not HALT.

### 6. Final summary

```
## Troubleshoot Complete

**Issue:** {ISSUE_IDENTIFIER} — fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}
**Root cause:** {ROOT_CAUSE_ONE_LINE}
**MR:** {MR_URL}
**Verdict:** {VERDICT or "Verification pending"}

### Evidence Trail
- Logs: {LOG_EVIDENCE_SUMMARY}
- Database: {DB_EVIDENCE_SUMMARY}
- Code: {CODE_EVIDENCE_SUMMARY}

### What was fixed
{FIX_SUMMARY}

### Regression test
{TEST_FILE_PATH} — reproduces the original bug
```

---

## END OF WORKFLOW

The bmad-troubleshoot workflow is complete.
