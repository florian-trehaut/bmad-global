# Step 7: Ship

## STEP GOAL

Run the full quality gate, perform a condensed self-review, push the branch, create a merge request, and update the tracker to In Review.

## RULES

- Quality gate must pass — HALT after 3 failures
- Self-review is inline (not parallel agents) — bug fixes have small diffs
- Use the project's push/MR skill if available in `LOCAL_SKILLS`
- NEVER push without quality gate passing

## SEQUENCE

### 1. Run quality gate

```bash
cd {WORKTREE_PATH} && {QUALITY_GATE}
```

**If quality gate fails:**
- Read the error output
- Fix the issue (format, lint, type error)
- Re-run. HALT after 3 consecutive failures.

### 2. Condensed self-review

Review the diff inline — this is a bug fix, not a feature, so a condensed review suffices:

```bash
cd {WORKTREE_PATH} && git diff origin/main --stat
cd {WORKTREE_PATH} && git diff origin/main
```

Check against these 5 criteria:

| # | Check | Look for |
|---|-------|----------|
| 1 | **Correctness** | Does the fix actually address the root cause, not just the symptom? |
| 2 | **Zero fallback** | No new silent defaults, no `\|\| fallback`, no `?? default` on required values |
| 3 | **Test quality** | Test reproduces the bug (not just happy path), no mocks |
| 4 | **Scope discipline** | Only the fix — no unrelated changes, no "while I'm here" cleanup |
| 5 | **Security** | No secrets exposed, no injection vectors, no tenant isolation breach |

If any check fails: fix it, re-commit, re-run quality gate.

### 3. Push and create MR

**If a push/MR skill exists in `LOCAL_SKILLS`:** invoke it.

**Otherwise:**

```bash
cd {WORKTREE_PATH}
git push -u origin HEAD
```

Create MR:
```bash
{FORGE_MR_CREATE} --title "fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}" --description "{ISSUE_IDENTIFIER}

## Summary
{ONE_LINE_ROOT_CAUSE}

## Test plan
- [x] Regression test written (RED/GREEN verified)
- [ ] Quality gate passed
- [ ] Deploy to staging and verify VM items"
```

Store `MR_IID` and `MR_URL`.

### 4. Update tracker

Update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Status: {TRACKER_STATES.in_review}

Add a comment on the tracker issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: {ISSUE_ID}
- Body: MR created: {MR_URL} — Fix pushed, quality gate passed. Awaiting review + merge + deploy to staging for VM verification.

### 5. Auto-proceed

MR created, tracker updated. Proceed to verification.

---

**Next:** Read fully and follow `./steps/step-08-verify.md`
