# Step 3: Design the Skill

## STEP GOAL

Design the complete skill — step sequence, data flow, knowledge dependencies, HALT conditions, and full file list. This is the blueprint. Nothing gets built until it is approved.

## RULES

- Load `../data/skill-conventions.md` and verify every design decision against it
- Every step must have a single clear goal expressible in one sentence
- Data flow must be explicit — which step produces what, which step consumes it
- HALT conditions must be comprehensive — missing these causes runaway execution
- File list must be exhaustive — every file that will be created

## SEQUENCE

### 1. Design the step sequence

For each step identified in step 2, flesh out:

| # | File | Goal (1 sentence) | Mode | Produces | Consumes |
|---|------|--------------------|------|----------|----------|
| XX | step-XX-name.md | {goal} | auto/interactive/mixed | {variables, files} | {variables, files, data refs} |

**Design principles:**
- **Early steps** = gather context, load data, verify preconditions
- **Middle steps** = core work (the "doing")
- **Late steps** = validate, report, clean up
- **First step** should orient the workflow (what are we working on?)
- **Last step** should summarize and provide next actions
- **Checkpoints** go in steps where a wrong decision is expensive to reverse

### 2. Design the data flow

Map how information flows through the skill:

```
Step 01 ──produces──> VARIABLE_A, VARIABLE_B
Step 02 ──consumes──> VARIABLE_A ──produces──> VARIABLE_C
Step 03 ──consumes──> VARIABLE_B, VARIABLE_C ──produces──> FILE_X
...
```

Verify:
- No step consumes a variable that hasn't been produced yet
- No variable is produced but never consumed (dead data)
- No circular dependencies

### 3. Design knowledge loading

For each `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/` file the skill needs:

| File | Loaded by step | Why |
|------|----------------|-----|
| {filename} | step-XX | {what information it provides to this step} |

**JIT rule:** knowledge files are loaded at the step that first needs them, not at initialization (unless the entire workflow depends on them).

### 4. Design HALT conditions

Two categories:

**Global HALTs** (apply at any step):
- List conditions that should stop the entire workflow regardless of current step

**Step-specific HALTs** (apply within one step):
- For each step that has HALT conditions, list them

Common HALT patterns:
- Missing required input (file, variable, user response)
- Precondition not met (wrong status, missing access)
- Error that cannot be auto-recovered
- User-facing decision with significant consequences

### 5. Design data files

For each data file identified in step 2:

| File | Purpose | Structure | Loaded by |
|------|---------|-----------|-----------|
| {filename} | {what it provides} | {format: rules, template, table, checklist} | step-XX |

Draft the outline of each data file (not full content — that comes in step 5).

### 6. Design subagent workflows (if applicable)

For each subagent:

| Subagent | Purpose | Invoked by | Input | Output format |
|----------|---------|------------|-------|---------------|
| {name} | {what it does} | step-XX | {what it receives} | {structured summary format} |

### 7. Compile the complete file list

```
{target_directory}/
├── SKILL.md
├── workflow.md
├── steps/
│   ├── step-01-{name}.md
│   ├── step-02-{name}.md
│   └── ...
├── data/                          # if needed
│   ├── {file1}.md
│   └── ...
├── templates/                     # if needed
│   └── ...
└── subagent-workflows/            # if needed
    └── ...
```

### 8. CHECKPOINT

Present the complete design document:

```
## Skill Design: bmad-{name}

### Step Sequence
{step table from section 1}

### Data Flow
{flow diagram from section 2}

### Knowledge Loading
{table from section 3}

### HALT Conditions
{global + step-specific from section 4}

### File List
{tree from section 7}
```

"Does this design look right? Any steps to add, remove, or reorder?"

WAIT for user approval. Apply corrections before proceeding.

---

**Next:** Read fully and follow `./steps/step-04-scaffold.md`
