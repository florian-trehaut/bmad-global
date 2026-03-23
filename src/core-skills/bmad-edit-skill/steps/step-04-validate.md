# Step 4: Post-Edit Validation

## STEP GOAL

Run validation checks on the modified skill to catch any issues introduced by the edits. Fix any problems found.

## RULES

- Run ALL checks — do not skip any
- If a check fails, attempt an auto-fix
- If auto-fix is not possible, report the issue with a suggested manual fix
- This step is the safety net — be thorough

## SEQUENCE

### 1. Structure checks

- [ ] **SKILL.md exists** and has correct frontmatter (name, description)
- [ ] **workflow.md exists** and has INITIALIZATION, STEP SEQUENCE, ENTRY POINT sections
- [ ] **At least 1 step file** exists in steps/ (or root)
- [ ] **No orphan step files** — every step file is referenced in workflow.md step sequence table
- [ ] **No orphan data files** — every data file in data/ is referenced by at least one step
- [ ] **Step numbering is sequential** — no gaps (01, 02, 03... not 01, 03, 05)
- [ ] **ENTRY POINT matches** — workflow.md entry point references an existing step file

### 2. NEXT pointer chain

Walk the entire step chain:

1. Start from the ENTRY POINT step file
2. Read each step, find its NEXT pointer (the "Proceed" section)
3. Verify the target file exists
4. Move to the next step
5. Continue until reaching the last step (which should have no forward NEXT pointer or says "End of workflow")
6. Verify that the chain covers ALL step files — no orphans

```
Chain: step-01 -> step-02 -> step-03 -> ... -> step-{N} (END)
Coverage: {N}/{N} steps — OK
```

**If broken:** fix the broken pointer.

### 3. Content quality checks

For each step file:

- [ ] **Line count < 250** (WARN at 200, FAIL at 300)
- [ ] **Has STEP GOAL section**
- [ ] **Has SEQUENCE section** (or equivalent instructions)
- [ ] **CHECKPOINT exists** where user input is expected (interactive steps)

### 4. Hardcoded reference check

Grep all files in the skill for common hardcoded patterns:

- Specific project names (not wrapped in `{VARIABLE_NAME}` placeholders)
- Hardcoded UUIDs
- Hardcoded URLs (except documentation links)
- Specific database names, table names, or column names
- References to `{project-root}/_bmad/` (legacy pattern)

Report any findings.

### 5. Report

```
## Post-Edit Validation

| Check | Status | Details |
|-------|--------|---------|
| Structure complete | PASS/FAIL | ... |
| No orphan steps | PASS/FAIL | ... |
| No orphan data files | PASS/FAIL | ... |
| Sequential numbering | PASS/FAIL | ... |
| NEXT pointer chain | PASS/FAIL | ... |
| Step sizes < 250 lines | PASS/WARN/FAIL | ... |
| No hardcoded references | PASS/WARN | ... |

**Issues found:** {count}
**Auto-fixed:** {count}
**Manual fix needed:** {count}
```

If issues remain that could not be auto-fixed, list them with suggested fixes.

### 6. Proceed

Load and execute `./steps/step-05-complete.md`.
