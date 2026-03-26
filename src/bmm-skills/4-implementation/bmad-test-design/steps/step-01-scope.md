# Step 1: Determine Scope and Load Context

## STEP GOAL

Determine whether the test design operates at epic-level (specific project) or system-level (whole codebase), then load all relevant context documents from the tracker.

## RULES

- If the user specifies an epic or project name, use **epic-level** mode
- If the user requests a system-wide review or does not specify a project, use **system-level** mode
- If ambiguous, ask the user to clarify before proceeding
- All documents must be loaded from the tracker — do not fabricate content

## SEQUENCE

### 1. Ask for scope (if not already provided)

If the user has not specified a target, ask:

> "Test design for a specific epic/project, or a system-level review?"

WAIT for user response.

### 2. Detect operating mode

Apply the following detection logic in priority order:

**A) Explicit user intent (highest priority):**

- User provides PRD + Architecture docs (no epic/stories) --> **system-level** (Phase 3 solutioning — architecture-wide test design)
- User provides Epic + Stories (no PRD/ADR) --> **epic-level** (Phase 4 implementation — focused test plan)
- User provides both PRD/ADR + Epic/Stories --> prefer **system-level** first (covers the broader scope)

**B) Context-based detection:**

- If `.claude/workflow-knowledge/sprint-status.yaml` (or similar sprint artifact) exists at project root --> **epic-level** (active implementation phase)
- Otherwise --> **system-level**

**C) If still ambiguous --> ask:**

> "Should I create (A) **System-level** test design (PRD + Architecture --> Architecture + QA docs for dev and QA teams), or (B) **Epic-level** test design (Epic --> single test plan)?"

WAIT for user response.

**If user specifies an epic/project:**

Set `MODE = "epic-level"`.

Load the Epic Project from the tracker (using CRUD patterns from tracker.md):
- Operation: Get project
- Query: PROJECT_NAME
- Include milestones: true

**If user requests system-level review OR no specific epic:**

Set `MODE = "system-level"`.

### 3. Load context documents

**Epic-level mode:**

1. List documents in the project (using CRUD patterns from tracker.md):
   - Operation: List documents
   - Project: PROJECT_ID

2. Find and load the **PRD** document (search for "PRD" in document titles).
   **HALT if not found:** "No PRD document found in project. A PRD is required for epic-level test design."

3. Find and load the **Architecture** document (search for "Architecture" in document titles).
   **HALT if not found:** "No Architecture document found in project. Architecture is required for test design."

4. Find and load the **UX Design** document if available (not required).

5. List all stories in the project (using CRUD patterns from tracker.md):
   - Operation: List issues
   - Team: {TRACKER_TEAM}
   - Project: PROJECT_NAME

**System-level mode:**

1. Load global documents from Meta Project (using CRUD patterns from tracker.md):
   - Operation: List documents
   - Project: {TRACKER_META_PROJECT_ID}

   Find and load "Project Context" and "Architecture Globale" documents.

2. List all active epics/projects (using CRUD patterns from tracker.md):
   - Operation: List epics/projects
   - Team: {TRACKER_TEAM}
   - State: started

### 4. CHECKPOINT

Present to the user:

> **Mode:** {MODE}
> **Target:** {project name or "System"}
> **Documents loaded:**
> - PRD: {title or "N/A"}
> - Architecture: {title or "N/A"}
> - UX Design: {title or "N/A"}
> **Stories/Projects found:** {count}

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-risk-assess.md`
