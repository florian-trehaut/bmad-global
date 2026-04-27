---
nextStepFile: './step-08-cleanup.md'
---

# Step 7: Publish

## STEP GOAL:

Save the finalized deliverable as a tracker Document for long-term reference. Update or create the spike issue with completion status and traceability links.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- Publishing creates the permanent record — the deliverable must be complete and accurate
- Traceability is critical: spike → deliverable → stories must all be linked

### Step-Specific Rules:

- HALT on tracker API failure — the deliverable content is in the conversation as fallback, but do not silently skip publishing
- Spikes CAN be set to Done (unlike implementation stories) — their DoD is "question answered, PoC functional, deliverable published"
- Auto-proceed after publishing

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before auto-proceeding
- Auto-proceed to next step

---

## MANDATORY SEQUENCE

### 1. Compose Tracker Document

Load `../templates/spike-deliverable.md`. Compose the full document combining:

- Spike metadata (date, type, timebox, question)
- KAC status table
- Full deliverable content from Step 4 (with Step 5 revisions)
- Stories created list from Step 6
- Related context links

### 2. Determine Document Placement

Check for existing spike documents (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List documents
- Project: {TRACKER_META_PROJECT_ID}

Look for a document titled `Spike: {title}`. If found, update it. If not, create it.

If the spike is associated with a specific epic/project (from Step 1): also consider placing the document in that project for direct proximity.

### 3. Save Document

**Create or update the tracker document** (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create document
- Title: Spike: {title}
- Project: {TRACKER_META_PROJECT}
- Content: {compiled_content}

Store `DOCUMENT_ID`.

**If write fails:** HALT — report error. The deliverable content is preserved in the conversation and WIP file.

### 4. Update Existing Spike Issue (if SPIKE_ISSUE_ID is not null)

Add a completion comment and close the issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):

Post a comment on the issue:
- Operation: Create comment
- Issue: {SPIKE_ISSUE_ID}
- Body: Spike completed. Verdict: {verdict}. Deliverable: Spike: {title}. Stories created: {list of identifiers}. See the spike deliverable document for full investigation context.

Update the issue:
- Operation: Update issue
- Issue: {SPIKE_ISSUE_ID}
- Status: {TRACKER_STATES.done}

Add label `Spike` if not already present.

### 5. Create Spike Issue (if SPIKE_ISSUE_ID is null)

If the spike was initiated ad-hoc (no pre-existing tracker issue), create one for traceability (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create issue
- Title: Spike: {title}
- Team: {TRACKER_TEAM}
- Description: Investigation completed. Question: {spike_question}. Verdict: {verdict}. See Document: Spike: {title}. Stories created: {list of identifiers}
- Status: {TRACKER_STATES.done}
- Labels: Spike

Store `SPIKE_ISSUE_ID` and `SPIKE_ISSUE_IDENTIFIER`.

### 6. Update WIP

Append publishing details:
- `document_id: {DOCUMENT_ID}`
- `spike_issue_identifier: {SPIKE_ISSUE_IDENTIFIER}`

Update `stepsCompleted`.

### 7. Auto-Proceed

Load, read entire file, then execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Deliverable published as tracker Document
- Spike issue updated to Done (or created if ad-hoc)
- Traceability chain complete: spike issue → document → informed stories
- Completion comment includes verdict and story references

### FAILURE:

- Silent fallback on API failure
- No traceability between spike and resulting stories
- Missing verdict in completion comment
- Spike issue left open after deliverable is published
