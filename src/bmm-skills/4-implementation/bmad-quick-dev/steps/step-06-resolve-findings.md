# Step 6: Resolve Findings

**Goal:** Handle adversarial review findings interactively, apply fixes, finalize.

---

## RESOLUTION OPTIONS

Present: "How would you like to handle these findings?"

**[W] Walk through** — Discuss each finding individually
**[F] Fix automatically** — Automatically fix issues classified as "real"
**[S] Skip** — Acknowledge and proceed

ALWAYS halt and wait for user input.

---

## WALK THROUGH [W]

For each finding in order:
1. Present the finding with context
2. Ask: **fix now / skip / discuss**
3. If fix: Apply the fix immediately
4. If skip: Note as acknowledged, continue
5. If discuss: Provide more context, re-ask
6. Move to next finding

After all findings processed, summarize what was fixed/skipped.

---

## FIX AUTOMATICALLY [F]

1. Filter findings to only those classified as "real"
2. Apply fixes for each real finding
3. Report what was fixed:

```
**Auto-fix Applied:**
- F1: {description of fix}
- F3: {description of fix}
...

Skipped (noise/uncertain): F2, F4
```

---

## SKIP [S]

1. Acknowledge all findings were reviewed
2. Note that user chose to proceed without fixes
3. Continue to completion

---

## UPDATE TECH-SPEC (Mode A only)

If `{execution_mode}` is "tech-spec":
1. Load `{tech_spec_path}`
2. Update status to "Completed"
3. Add review notes with finding count, fixes applied, resolution approach
4. Save changes

---

## COMPLETION OUTPUT

```
**Review complete. Ready to commit.**

**Implementation Summary:**
- {what was implemented}
- Files modified: {count}
- Tests: {status}
- Review findings: {X} addressed, {Y} skipped
```

---

## WORKFLOW COMPLETE

This is the final step. The Quick Dev workflow is now complete.

User can:
- Commit changes
- Run additional tests
- Start new Quick Dev session
