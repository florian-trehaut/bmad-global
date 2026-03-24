# Step 6: Review Generated Knowledge

## STEP GOAL

Present each generated knowledge file to the user for validation. The user can accept, edit, or reject each file individually.

## RULES

- Present ONE file at a time — do not batch
- Show the COMPLETE file content, not a summary
- Respect the user's edits without question
- Rejected files are dropped — they will not be written

## SEQUENCE

### 1. For Each Draft

For each generated draft (from step 5), in this order:
1. `stack.md`
2. `infrastructure.md`
3. `conventions.md`
4. `review-perspectives.md`
5. `tracker.md`
6. `environment-config.md`
7. `investigation-checklist.md`
8. `domain-glossary.md`
9. `api-surface.md`

(Skip files not in TARGET_FILES.)

#### a. Present Draft

```
## Review: {filename} ({N} lines)

{full file content}
```

#### b. CHECKPOINT — User Decision

- **[A] Accept** — file will be written as-is
- **[E] Edit** — user provides corrections, regenerate or apply edits
- **[R] Reject** — file will not be written

WAIT for user response.

#### c. Handle Response

- **Accept**: mark file as `APPROVED`
- **Edit**: apply user corrections, re-present for confirmation
- **Reject**: mark file as `REJECTED`, log reason if provided

### 2. Review Summary

After all files reviewed:

```
## Review Complete

Approved: {N} files
  - stack.md
  - infrastructure.md
  - ...

Rejected: {N} files
  - {filename}: {reason or "user choice"}

Ready to write {N} approved files?
```

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-07-write.md`
