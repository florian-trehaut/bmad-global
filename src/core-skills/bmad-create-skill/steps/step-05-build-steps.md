# Step 5: Build Step Files

## STEP GOAL

Write every step file, data file, template file, and subagent workflow file defined in the design. This is the bulk of the work.

## RULES

- Use `./templates/step-template.md` as the starting point for each step file
- Each step file MUST be < 250 lines (target < 200)
- Each step file MUST be self-contained — understandable without reading other steps
- Each step file MUST end with a NEXT pointer (or END OF WORKFLOW for the last)
- Variables use `{VARIABLE_NAME}` format
- No hardcoded project-specific values — everything from workflow-context.md
- Load `../data/skill-conventions.md` to verify each file against conventions
- Write data files BEFORE the step files that reference them

## SEQUENCE

### 1. Write data files first

For each data file in the design:
1. Read the placeholder created in step 4
2. Write the full content based on the design specification
3. Verify the file is self-contained and has a clear purpose header

Data file format:
```markdown
# {Title}

{Purpose — one paragraph explaining what this file provides and which steps load it.}

---

{Content: tables, rules, templates, checklists, etc.}
```

### 2. Write template files (if any)

For each template file:
1. Write the template with clear placeholder markers
2. Use `{PLACEHOLDER}` format for values to be filled in
3. Include comments explaining each section

### 3. Write subagent workflow files (if any)

For each subagent workflow:
1. Write the subagent instructions
2. Include: role, input format, output format, rules
3. Specify the structured summary format the subagent must return

Subagent file format:
```markdown
# Subagent: {Name}

## Input

{What the subagent receives from the orchestrating step}

## Your Role

{Role description}

## Rules

{Subagent-specific rules}

## Output Format

{Exact structured format the subagent must return — the orchestrating step depends on this}
```

### 4. Build step files iteratively

For EACH step in the design, in order:

#### 4a. Determine step characteristics

From the design:
- **Goal**: one-sentence goal
- **Mode**: auto / interactive / mixed
- **Consumes**: variables and data files
- **Produces**: variables and files
- **Has CHECKPOINT**: yes/no
- **Has HALT conditions**: yes/no

#### 4b. Write the step file

Use `./templates/step-template.md` and customize:

**Header**: Step number and descriptive name
```markdown
# Step {N}: {Name}
```

**STEP GOAL**: One paragraph explaining what this step accomplishes.

**RULES**: Step-specific rules (not workflow-global rules — those are in workflow.md).

**SEQUENCE**: Numbered instructions, each with:
- Clear action to take
- Expected outcome
- Error handling (if applicable)

**CHECKPOINT** (if interactive): Present findings/decisions, wait for user input.

**NEXT**: Pointer to the next step file.
```markdown
---

**Next:** Read fully and follow `./steps/step-{NN}-{name}.md`
```

Or for the last step:
```markdown
---

## END OF WORKFLOW

The bmad-{SKILL_NAME} workflow is complete.
```

#### 4c. Verify the step file

Check:
- [ ] < 250 lines
- [ ] Has STEP GOAL section
- [ ] Has SEQUENCE section with numbered steps
- [ ] Has NEXT pointer or END OF WORKFLOW
- [ ] Has CHECKPOINT if the design specified interactive mode
- [ ] All `{VARIABLE}` references are to variables that exist at this point in the flow
- [ ] All data file references (`./data/*.md`) point to files that exist
- [ ] No hardcoded project-specific values
- [ ] Self-contained — can be understood without reading other steps

#### 4d. Track progress

After each step file is written, report:

"Step file {N} of {TOTAL} built: `step-{NN}-{name}.md` ({line_count} lines)"

### 5. Verify completeness

After all files are built:

```bash
ls -la {TARGET_DIR}/
ls -la {TARGET_DIR}/steps/
ls -la {TARGET_DIR}/data/ 2>/dev/null
ls -la {TARGET_DIR}/templates/ 2>/dev/null
ls -la {TARGET_DIR}/subagent-workflows/ 2>/dev/null
```

Verify every file from the design's file list exists and is non-empty.

Report: "{TOTAL_FILES} files built. Proceeding to validation."

---

**Next:** Read fully and follow `./steps/step-06-validate.md`
