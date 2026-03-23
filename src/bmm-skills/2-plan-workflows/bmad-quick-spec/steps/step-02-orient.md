---
nextStepFile: './step-02b-business-context.md'
advancedElicitationTask: '{project-root}/_bmad/core/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '{project-root}/_bmad/core/bmad-party-mode/workflow.md'
---

# Step 2: Orient & Scope

## STEP GOAL:

Scan the codebase and tracker for context, ask informed questions (not generic), and capture the core understanding (problem, solution, scope).

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a Spec Engineering Facilitator
- Collaborative dialogue -- you bring code awareness, user brings domain expertise
- Together we produce a precise scope

### Step-Specific Rules:

- Focus on scoping and understanding -- no deep investigation yet
- FORBIDDEN: generic questions like "What's the scope?" or "What are the requirements?"
- Approach: scan code first, then ask questions grounded in what you found

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Update WIP file before presenting checkpoint menu
- ALWAYS halt and wait for user input at menu

## CONTEXT BOUNDARIES:

- Available: worktree at {SPEC_WORKTREE_PATH}, tracker access, project context
- Focus: scoping, not deep investigation
- Dependencies: Step 1 completed, worktree exists

---

## MANDATORY SEQUENCE

### 1. Quick Context Scan

**Launch parallel searches where subprocess is available:**

**IF `{TRACKER}` == `file` (file-based tracker):**

- Read `{project-root}/{TRACKER_EPICS_FILE}` — scan epic titles and descriptions for relevance to the user's request. Extract epic numbers, names, and scope summaries.
- Scan `{project-root}/{TRACKER_STORY_LOCATION}/` — list existing story files, grep filenames and titles for keywords related to the request. Note which epics have stories, which story numbers exist.
- If a matching epic is found, note it as `RELATED_EPIC` with its number, name, and story count.
- If existing stories overlap with the request, note them as `RELATED_STORIES`.

**ELSE (MCP-based tracker):**

- Check tracker for related issues: `{TRACKER_MCP_PREFIX}list_issues(team: '{TRACKER_TEAM}', query: '{keywords}', limit: 5)`
- Check for related Project (Epic): `{TRACKER_MCP_PREFIX}list_projects(team: '{TRACKER_TEAM}')`

**BOTH:**

- Skim project context for relevant patterns

If user mentioned specific code/features, do a quick scan **inside {SPEC_WORKTREE_PATH}** (read-only):

- Search for relevant files/classes/functions using grep subprocess
- Note tech stack, obvious patterns, file locations
- DON'T deep-dive -- that's Step 3

### 2. Ask Informed Questions

Ask questions grounded in what you found. Make them specific, not generic.

Instead of "What's the scope?", ask things like:

- "`AuthService` handles validation in the controller -- should the fix follow that pattern or move it?"
- "I see there's already an issue {ISSUE_PREFIX}-XX about Y -- is this related or separate?"
- "The current implementation uses X pattern -- should we stick with it?"

Adapt to {USER_SKILL_LEVEL}. Technical users want technical questions.

### 3. Capture Core Understanding

From the conversation, capture:

- **Title**: Clear, concise name
- **Slug**: URL-safe version (lowercase, hyphens)
- **Type**: bug | task | feature | improvement
- **Problem Statement**: What problem are we solving?
- **Solution**: High-level approach (1-2 sentences)
- **In Scope**: What's included
- **Out of Scope**: What's explicitly NOT included

Present as a narrative summary first, then the structured list. Ask user to confirm before proceeding.

### 4. Update WIP File

Append problem/solution/scope sections to WIP file. Set `stepsCompleted: [1, 2]`.

### 5. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to business context (Step 2b)"

#### Menu Handling Logic:

- IF A: Read fully and follow {advancedElicitationTask} with current understanding, process insights, ask "Accept improvements? (y/n)", if yes update understanding then redisplay menu, if no keep original then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow} with current understanding, process insights, ask "Accept changes? (y/n)", if yes update understanding then redisplay menu, if no keep original then redisplay menu
- IF C: Save WIP, then load, read entire file, then execute {nextStepFile}
- IF any other: Respond helpfully then [Redisplay Menu Options](#5-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'
- After other menu items execution, return to this menu

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Quick scan performed (tracker + code)
- Informed questions asked (not generic)
- Core understanding captured and confirmed by user
- WIP file updated
- Menu presented and user selection handled

### FAILURE:

- Asking generic questions without scanning first
- Deep-diving into code (too early)
- Proceeding without user confirmation of scope
- Not saving WIP before menu
