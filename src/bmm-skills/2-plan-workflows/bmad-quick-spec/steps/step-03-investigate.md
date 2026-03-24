---
nextStepFile: './step-04-model.md'
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
---

# Step 3: Deep Investigation

## STEP GOAL:

Investigate the codebase deeply inside the worktree to identify patterns, files to modify, test patterns, and technical context.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator with deep code investigation skills
- Collaborative dialogue -- user guides what to explore, you bring findings
- Together we build a complete technical picture

### Step-Specific Rules:

- Focus on understanding existing code patterns -- not proposing solutions yet
- FORBIDDEN: modifying any files in the worktree
- Approach: read-only investigation, present findings, confirm with user

## EXECUTION PROTOCOLS:

- DO NOT BE LAZY -- For EACH relevant file, use subprocess when available to analyze patterns and return structured findings (Pattern 2: per-file deep analysis)
- Update WIP file before presenting checkpoint menu
- ALWAYS halt and wait for user input at menu

## CONTEXT BOUNDARIES:

- Available: worktree at {SPEC_WORKTREE_PATH}, all findings from Step 2
- Focus: deep code patterns, not data modeling (that's Step 4)
- Dependencies: Step 2 completed, scope confirmed

---

## MANDATORY SEQUENCE

### 1. Guide Investigation

Build on Step 2's quick scan. Ask user:

> I found [files/patterns found in Step 2]. Are there other files or directories I should explore in depth?

### 2. Deep Code Analysis

For each relevant file/directory **inside {SPEC_WORKTREE_PATH}**:

- Read the complete file(s)
- Identify patterns, conventions, coding style
- Note dependencies and imports
- Find related test files

**Use subprocess per file when available** -- each subprocess reads one file, analyzes patterns/conventions/dependencies, and returns a structured summary (key patterns, imports, test file locations). Parent aggregates summaries.

**If NO relevant code found (Clean Slate):**

- Identify the target directory where the feature should live
- Scan parent directories for architectural context
- Identify standard project utilities or boilerplate that SHOULD be used
- Document as "Confirmed Clean Slate"

### 3. Cross-Reference with Standards

If `.claude/workflow-knowledge/stack.md` exists at project root, load and cross-reference investigation results with project dev standards. Note any deviations or patterns the implementation must follow.

### 4. Document Technical Context

Confirm with user:

- **Tech Stack**: Languages, frameworks, libraries
- **Code Patterns**: Architecture patterns, naming conventions, file structure
- **Files to Modify/Create**: Specific files that will need changes
- **Test Patterns**: How tests are structured, test frameworks used

### 5. Update WIP File

Append technical context section to WIP file. Set `stepsCompleted: [1, 2, 2b, 3]`.

### 6. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Data & Infra Modeling (Step 4)"

#### Menu Handling Logic:

- IF A: Read fully and follow {advancedElicitationTask} with current context, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow} with current context, process insights, ask "Accept? (y/n)", if yes update then redisplay menu
- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF any other: Respond helpfully then [Redisplay Menu Options](#6-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Deep investigation of all relevant files completed
- Subprocess per file used when available (context savings)
- Dev standards cross-referenced (if stack.md exists)
- Technical context documented and confirmed by user
- WIP file updated
- Menu presented and handled

### FAILURE:

- Skipping files or being lazy about investigation
- Modifying worktree files
- Not cross-referencing dev standards when available
- Proceeding without user confirmation of technical context
