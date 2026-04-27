# Validation Verdict Protocol

**This document is loaded by all bmad-validation-* workflow skills.** It defines the common verdict compilation and reporting protocol for business validation workflows.

---

## Purpose

Standardize how validation skills compile results, compose tracker comments, post reports, and update issue status. Each validation skill's verdict step loads this protocol as baseline rules.

---

## Verdict Compilation

Analyze `VM_RESULTS`:

- Count PASS and FAIL
- **Verdict = PASS** if and only if ALL VM items are PASS
- **Verdict = FAIL** if AT LEAST ONE VM item is FAIL

The verdict is BINARY. No partial pass, no "pass with caveats."

---

## Tracker Comment Composition

Load the skill-local `../data/tracker-comment-template.md`.

Use the PASS or FAIL template according to the verdict.

Fill in all placeholders:
- `{issue_identifier}`: issue identifier
- `{environment}`: environment used
- `{date}`: today's date
- `{user_name}`: `USER_NAME` from workflow-context.md
- `{dod_summary}`: DoD summary
- `{vm_rows}`: one row per VM with id, description, type, verdict, proof
- If FAIL: `{failed_vm_details}` with the detail of each failed VM

---

## User Confirmation Flow

**If PASS:**
"All VM items are validated. I will post this comment and move the issue to **Done**. Do you confirm? [Y]es / [N]o"

**If FAIL:**
"**{fail_count}/{total_count}** VM items failed. I will post this comment. The issue will remain in its current status. Do you confirm? [Y]es / [N]o"

WAIT for confirmation before posting.

---

## Tracker Operations

### Post Comment

Post a comment on the issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: `ISSUE_ID`
- Body: `{composed_comment}`

**If API failure:** HALT — "Error posting the tracker comment. Error: {error}. The comment is displayed above, you can copy it manually."

### Update Status

**If PASS:**
- Update issue status to `{TRACKER_STATES.done}`
- Display: "Issue **{ISSUE_IDENTIFIER}** moved to **Done**."

**If FAIL:**
- Do NOT change the status (stays in current status)
- Display: "Issue **{ISSUE_IDENTIFIER}** remains in current status. Fix the failed VM items and re-launch validation."

---

## Worktree Cleanup

Remove the worktree created during the workflow:

```bash
git worktree remove {WORKTREE_PATH} --force
```

If removal fails, log a warning but do not HALT — this is non-blocking.

---

## Final Summary Banner

```
======================================
  VALIDATION {DOMAIN} — {PASS|FAIL}
  Issue: {ISSUE_IDENTIFIER}
  Env: {ENVIRONMENT}
  VM: {pass_count}/{total_count} passed
  Status: {new_status}
======================================
```

Where `{DOMAIN}` is the skill's domain name (Metier, Desktop, Frontend, etc.).

---

## Rules

- The verdict is BINARY: ALL PASS = PASS / ANY FAIL = FAIL
- NEVER move to "Done" an issue with a failed VM item
- NEVER post a comment without the proof of each VM item
- Confirm with the user before changing the issue status
