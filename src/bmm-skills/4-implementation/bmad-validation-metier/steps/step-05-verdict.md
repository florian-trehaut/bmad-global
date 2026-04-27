# Step 5: Verdict

## STEP GOAL

Compile the final verdict, compose a structured tracker comment, post the comment, and update the issue status.

## RULES

- Load `~/.claude/skills/bmad-shared/validation-verdict-protocol.md` and apply its protocol as baseline rules for this step
- The verdict is BINARY: ALL PASS = PASS / ANY FAIL = FAIL
- Load `../data/tracker-comment-template.md` for the comment format
- NEVER move to "Done" an issue with a failed VM item
- NEVER post a comment without the proof of each VM item
- Confirm with the user before changing the issue status

## SEQUENCE

### 1. Compile the verdict

Analyze `VM_RESULTS`:

- Count PASS and FAIL
- **Verdict = PASS** if and only if ALL VM items are PASS
- **Verdict = FAIL** if AT LEAST ONE VM item is FAIL

### 2. Compose the tracker comment

Load `../data/tracker-comment-template.md`.

Use the PASS or FAIL template according to the verdict.

Fill in:
- `{issue_identifier}`: issue identifier
- `{environment}`: environment used
- `{date}`: today's date
- `{user_name}`: `USER_NAME` from workflow-context.md
- `{dod_summary}`: DoD summary
- `{vm_rows}`: one row per VM with id, description, type, verdict, proof
- If FAIL: `{failed_vm_details}` with the detail of each failed VM

### 3. Present the report to the user

Display the complete comment.

**If PASS:**
"All VM items are validated. I will post this comment and move the issue to **Done**. Do you confirm? [Y]es / [N]o"

**If FAIL:**
"**{fail_count}/{total_count}** VM items failed. I will post this comment. The issue will remain in its current status. Do you confirm? [Y]es / [N]o"

WAIT for confirmation.

### 4. Post the tracker comment

Post a comment on the issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: ISSUE_ID
- Body: {composed_comment}

**If API failure:** HALT — "Error posting the tracker comment. Error: {error}. The comment is displayed above, you can copy it manually."

### 5. Update the status

**If PASS:**

Update the issue in the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Update issue
- Issue: ISSUE_ID
- Status: {TRACKER_STATES.done}

Display: "Issue **{ISSUE_IDENTIFIER}** moved to **Done**."

**If FAIL:**

Do NOT change the status (stays in current status).

Display: "Issue **{ISSUE_IDENTIFIER}** remains in current status. Fix the failed VM items and re-launch validation."

### 6. Cleanup worktree

Remove the worktree created in step 1:

```bash
git worktree remove {WORKTREE_PATH} --force
```

If removal fails, log a warning but do not HALT — this is non-blocking.

### 7. Final summary

```
======================================
  VALIDATION METIER — {PASS|FAIL}
  Issue: {ISSUE_IDENTIFIER}
  Env: {ENVIRONMENT}
  VM: {pass_count}/{total_count} passed
  Status: {new_status}
======================================
```

End of workflow.
