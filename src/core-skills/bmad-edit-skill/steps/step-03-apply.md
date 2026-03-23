# Step 3: Apply Changes

## STEP GOAL

Execute the approved edit plan. For each item, read the target file, apply the modification, and verify structural integrity after each change.

## RULES

- Follow the edit plan EXACTLY as approved — no additions, no omissions
- After adding/removing a step: renumber ALL subsequent steps and fix ALL NEXT pointers
- After any change to steps: update the workflow.md step sequence table
- New step files MUST follow the standard step template structure (STEP GOAL, RULES, SEQUENCE sections)
- Each modified file MUST stay < 250 lines (WARN at 200)
- If a change cannot be applied as planned — HALT and report the issue

## SEQUENCE

### 1. Apply changes in dependency order

Process the edit plan items in an order that maintains consistency:

1. **Data files first** — create/modify/delete data files (no dependencies)
2. **Subagent workflows** — create/modify/delete subagent files
3. **Step files** — modify existing, then add new, then remove old
4. **Renumbering** — if steps were added/removed, renumber all affected steps
5. **NEXT pointers** — fix all NEXT pointers in step files
6. **workflow.md** — update step sequence table, any other workflow-level changes
7. **SKILL.md** — update trigger phrases or description if needed

### 2. For each file modification

```
Applying: {change description}
  Target: {file_path}
  Action: {MODIFY|CREATE|DELETE}
```

**MODIFY:**
1. Read the current file content
2. Apply the specific change
3. Verify the result is syntactically correct
4. Verify line count < 250

**CREATE:**
1. Use the standard template structure for the file type:
   - Step files: STEP GOAL, RULES, SEQUENCE, Proceed sections
   - Data files: clear heading, structured content
2. Write the file
3. Verify line count < 250

**DELETE:**
1. Confirm the file is no longer referenced by any other file
2. Delete the file

### 3. Renumber steps (if needed)

If steps were added or removed:

1. List all step files in the correct new order
2. For each step file that needs a new number:
   - Rename `step-{old}-{name}.md` to `step-{new}-{name}.md`
   - Update the heading inside the file (`# Step {new}: ...`)
3. Track the mapping: `step-{old} -> step-{new}`

### 4. Fix NEXT pointers

For every step file in the skill:

1. Read the file
2. Find the "Proceed" section (or equivalent NEXT pointer)
3. Verify it points to the correct next step file
4. If incorrect — fix it
5. For the last step: verify it says "End of workflow." (or has no NEXT pointer)

### 5. Update workflow.md step sequence table

Read `workflow.md` and update the step sequence table to match the actual step files:

```
| Step | File | Goal | Mode |
| ---- | ---- | ---- | ---- |
| 1 | `step-01-{name}.md` | {goal} | {mode} |
| ...
```

Also update the ENTRY POINT if step-01 was renamed or replaced.

### 6. Report progress

After all changes are applied:

```
## Changes Applied

| # | Action | File | Status |
|---|--------|------|--------|
| 1 | MODIFY | steps/step-03-setup-worktree.md | Done |
| 2 | CREATE | data/proxy-config.md | Done |
| 3 | MODIFY | workflow.md | Done |

Step renumbering: {mapping or "not needed"}
NEXT pointers: {count} verified/fixed
```

### 7. Proceed

Load and execute `./steps/step-04-validate.md`.
