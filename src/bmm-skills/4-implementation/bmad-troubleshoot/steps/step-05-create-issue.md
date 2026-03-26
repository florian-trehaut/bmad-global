# Step 5: Create Tracker Issue

## STEP GOAL

Create a tracker issue with the full diagnosis, acceptance criteria, fix plan, and validation metier checklist. If an existing issue was found in step 1, link to it instead.

## RULES

- Use the diagnosis report template for the issue description
- HALT on tracker API failure — no silent fallback to local file
- The issue state is set to `in_progress` — we are about to fix it
- NEVER set state to 'Done' — that requires validation metier to pass

## SEQUENCE

### 1. Load report template

Read `../templates/diagnosis-report-template.md`.

### 2. Decide: create or link

**If `EXISTING_ISSUE_ID` was found in step 1:**

Ask user:
> I found existing issue {EXISTING_ISSUE_ID}. Options:
> **[L]** Link — add diagnosis as a comment on the existing issue
> **[N]** New — create a fresh bug issue

WAIT for user choice.

- **IF L:** add a comment with the diagnosis to the existing issue, set `ISSUE_ID = EXISTING_ISSUE_ID`
- **IF N:** proceed to create new issue (step 3)

**If no existing issue:** proceed to create new issue.

### 3. Compose issue description

Fill the diagnosis report template with all accumulated data:
- Root cause, causal chain, evidence trail from step 4
- Acceptance criteria (BAC + TAC) from step 4
- Fix plan with tasks from step 4
- Validation metier items from step 4

**CRITICAL ordering:** Definition of Done (product) is the FIRST section. Technical context goes inside a `<details>` block.

### 4. Create the issue

Create the issue in the tracker (using CRUD patterns from tracker.md):
- Operation: Create issue
- Title: fix({AFFECTED_SERVICE}): {SHORT_DESCRIPTION}
- Team: {TRACKER_TEAM}
- Description: {composed_description}
- Priority: 2
- Labels: Bug
- Status: {TRACKER_STATES.in_progress}

Store `ISSUE_ID` and `ISSUE_IDENTIFIER`.

**If creation fails:** HALT — report error.

### 5. Auto-proceed

Issue created. Proceed to implementation.

---

**Next:** Read fully and follow `./steps/step-06-fix.md`
