---
nextStepFile: './step-07-create-issue.md'
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
adversarialReview: '~/.claude/skills/bmad-review-adversarial-general/SKILL.md'
---

# Step 6: Review & Finalize

## STEP GOAL:

Present the complete spec to the user for review. Offer editing, questioning, adversarial review, and refinement options before finalizing.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator presenting work for validation
- The user is the final arbiter -- their approval is required to proceed
- You bring completeness checking, user brings domain validation

### Step-Specific Rules:

- Focus on review and refinement -- all generation is done
- FORBIDDEN: proceeding to issue creation without explicit user approval [C]
- Approach: present, listen, iterate until the user is satisfied

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Update WIP file before presenting checkpoint menu
- ALWAYS halt and wait for user input at menu
- Loop until user selects [C]

## CONTEXT BOUNDARIES:

- Available: complete spec from all previous steps
- Focus: quality assurance, user approval
- Dependencies: Step 5b completed, all content generated

---

## MANDATORY SEQUENCE

### 1. Present Complete Spec

Present the full spec content assembled from all previous steps:

> Here is the complete spec. Please review:
>
> ---
> {full_spec_content}
> ---
>
> **Summary:**
> - {task_count} implementation tasks
> - {ac_count} acceptance criteria
> - {files_count} files to modify/create

### 2. Update WIP File

Update `stepsCompleted` to add this step.

### 3. Present MENU OPTIONS

Display: "**Select:** [C] Create tracker issue [E] Edit [Q] Questions [A] Advanced Elicitation [P] Party Mode [R] Adversarial Review"

#### Menu Handling Logic:

- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF E: Apply user's requested edits, re-present spec, then [Redisplay Menu Options](#3-present-menu-options)
- IF Q: Answer questions, then [Redisplay Menu Options](#3-present-menu-options)
- IF A: Read fully and follow {advancedElicitationTask}, process, ask "Accept? (y/n)", if yes update spec, then [Redisplay Menu Options](#3-present-menu-options)
- IF P: Read fully and follow {partyModeWorkflow}, process, ask "Accept? (y/n)", if yes update spec, then [Redisplay Menu Options](#3-present-menu-options)
- IF R: Execute adversarial review (see below), then [Redisplay Menu Options](#3-present-menu-options)
- IF any other: Respond helpfully then [Redisplay Menu Options](#3-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

### Adversarial Review [R] Process

1. Invoke review task: {adversarialReview}
   - If subagent available: run in separate process with spec content only (information asymmetry)
   - Fallback: load task file and follow inline in main context
2. Process findings:
   - If zero findings -> suspicious, re-analyze or ask user
   - Evaluate severity (Critical, High, Medium, Low) and validity (real, noise, undecided)
   - DO NOT exclude findings based on severity
   - Order by severity, number as F1, F2, F3...
   - Present as table: ID | Severity | Validity | Description
3. Return to review menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Complete spec presented to user
- All menu options functional (C/E/Q/A/P/R)
- Adversarial review uses {adversarialReview} variable (not hardcoded path)
- User explicitly selects [C] before proceeding
- WIP file updated

### FAILURE:

- Proceeding without user's explicit [C] selection
- Hardcoding adversarial review path instead of using variable
- Not re-presenting menu after non-C selections
