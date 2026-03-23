# Step 5: Complete

## STEP GOAL

Present a summary of all changes made and suggest next steps.

## SEQUENCE

### 1. List all files modified/created/deleted

```
## Edit Summary — {TARGET_SKILL.name}

### Files modified
- {file_path} — {what changed}
- ...

### Files created
- {file_path} — {purpose}
- ...

### Files deleted
- {file_path} — {reason}
- ...
```

### 2. Show final structure

```
### Final Structure
- SKILL.md
- workflow.md
- steps/
  - step-01-{name}.md ({lines} lines)
  - step-02-{name}.md ({lines} lines)
  - ...
- data/
  - {files}
```

### 3. Show renumbering map (if applicable)

If any steps were renumbered:

```
### Step Renumbering
- step-03-old-name.md -> step-04-old-name.md
- step-04-old-name.md -> step-05-old-name.md
```

### 4. Suggest next steps

"Edit complete. You may want to:"
- "Run `/bmad-validate-skill` for a deeper convention compliance check"
- "Test the workflow by invoking `/bmad-{name}`"

End of workflow.
