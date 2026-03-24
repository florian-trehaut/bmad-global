# Step 7: Write Knowledge Files

## STEP GOAL

Write all approved knowledge files to `.claude/workflow-knowledge/` and report results.

## RULES

- Only write files marked as APPROVED in step 6
- Create the directory if it does not exist
- Overwrite existing files (the user approved the replacement in step 6)

## SEQUENCE

### 1. Ensure Directory Exists

```bash
mkdir -p .claude/workflow-knowledge
```

### 2. Write Approved Files

For each APPROVED file:

1. Write the complete content (frontmatter + body) to `.claude/workflow-knowledge/{filename}`
2. Log: "Written: {filename} ({N} lines)"

### 3. Report

```
## Knowledge Bootstrap Complete

### Written
{for each written file:}
- .claude/workflow-knowledge/{filename} ({N} lines, source_hash: {hash})
{endfor}

### Rejected (not written)
{for each rejected file:}
- {filename}: {reason}
{endfor}

### Summary
- Files written: {N}
- Files rejected: {N}
- Total knowledge files now in .claude/workflow-knowledge/: {total count}
```

---

## END OF WORKFLOW

The bmad-knowledge-bootstrap workflow is complete.
