---
nextStepFile: './step-07-plan-approval.md'
---

# Step 6: Mark In Progress & Load Test Strategy

## STEP GOAL:

Update tracker status and load or auto-generate the test strategy from the issue description.

## MANDATORY SEQUENCE

### 1. Update Tracker Status

Update the issue in the tracker (using CRUD patterns from workflow-knowledge/tracker.md):
- Operation: Update issue
- Issue: {ISSUE_ID}
- Status: {TRACKER_STATES.in_progress}

### 2. Load Test Strategy

Parse the issue description for a test strategy section (e.g., `## Test Strategy`, `## Strategie de Test`).

<check if="test strategy section found">
  Extract the test strategy table.
  For each AC, store: priority (P0-P3), expected test levels (Unit/Integration/Journey), key scenarios.
  Store TEST_STRATEGY = parsed table.

  **Validate coherence:**
  - Every AC has at least one test level assigned
  - P0 ACs have Integration or Journey tests (not Unit-only)
  - No test level is empty for the entire story

  <check if="validation issues found">
    Display issues and apply corrections.
  </check>
</check>

<check if="no test strategy section found">
  Auto-generate minimal strategy:
  - Default priority P1 (adjust: auth/payment/security -> P0, admin/reporting -> P2)
  - Default test level: Unit + Integration

  Display generated strategy to user (do NOT halt).
</check>

Store TEST_STRATEGY for use in Steps 7-8.

### 3. Proceed

Load and execute {nextStepFile}.

## SUCCESS/FAILURE:

### SUCCESS: Status updated, test strategy loaded or auto-generated
### FAILURE: Skipping status update, no test strategy
