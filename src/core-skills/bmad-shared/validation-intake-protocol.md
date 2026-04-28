# Validation Intake Protocol

**This document is loaded by all bmad-validation-* workflow skills.** It defines the common intake protocol for business validation workflows.

---

## Purpose

Standardize how validation skills discover, load, and prepare issues for validation. Each validation skill's step-01 loads this protocol as baseline rules, then adds its domain-specific extensions (environment selection, worktree setup timing).

---

## Issue Discovery

### If the user provided an identifier

Store `ISSUE_IDENTIFIER`, proceed to issue loading.

### If no identifier provided

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: `{TRACKER_TEAM}`
- Status: `{TRACKER_STATES.to_test}`
- Limit: 20

Store results in `TO_TEST_CANDIDATES[]`.

**If no candidates:** "No issues in 'To Test' status found in team {TRACKER_TEAM}. Nothing to validate." — End of workflow.

**If candidates found:** Present a numbered table with Issue, Title, Assignee columns. WAIT for user selection.

---

## Issue Loading

Fetch the issue from the tracker:
- Operation: Get issue
- Identifier: `ISSUE_IDENTIFIER`

**Status verification:** The issue MUST be in "To Test" status (matching `TRACKER_STATES.to_test`). If different status, HALT: "Issue {ISSUE_IDENTIFIER} is in status '{status}', not in 'To Test'. Business validation only applies to issues in 'To Test'."

Store `ISSUE_ID`, `ISSUE_TITLE`, `ISSUE_DESCRIPTION`.

---

## VM and DoD Parsing (story-spec v2 aware)

Search in `ISSUE_DESCRIPTION`:

**Definition of Done (product)** — section starting with a heading containing "Definition of Done" or "DoD". (Mandatory)

**Validation Metier** — section starting with a heading containing "Validation Metier", "Validation Métier", or "VM". Each item starts with `VM-N` or a checkbox `- [ ]`. (Mandatory)

### Story-spec v2 optional sections (additive parsing — none halts the workflow)

If the issue follows the **story-spec v2 schema** (`~/.claude/skills/bmad-shared/spec-completeness-rule.md`), the following additional sections may be parsed for richer validation:

**NFR Registry** — section heading "NFR Registry" or "NFRs". Parse the table for any row marked PRESENT/PARTIAL with a measurable target (Performance latency, Scalability throughput, etc.). For each measurable target, optionally generate a derived validation step (e.g. perf measurement during the test environment session). Marked as **`vm_derived_nfr`** in the structured list.

**Security Gate** — section heading "Security Gate". If verdict is FAIL or items are listed with FAIL status, parse the remediation tasks. For compliance-heavy stories (GDPR, HIPAA, SOC2, PCI-DSS), optionally generate a derived audit-trail validation step. Marked as **`vm_derived_security`**.

**Observability Requirements** — section heading "Observability Requirements". Parse mandatory log events / alerts / dashboards. Optionally generate a derived dashboard-check validation step (open dashboard, verify panels populated). Marked as **`vm_derived_observability`**.

**Out-of-Scope register** — section heading "Out of Scope". Use this to verify that the test session does NOT inadvertently exercise out-of-scope flows (would indicate scope creep in the implementation).

**Boundaries Triple — Never Do** — section heading "Boundaries". Validation-side check: ensure the test environment did not expose any "Never Do" item (e.g. PII in error messages, secrets in logs).

These derived items are presented as **OPTIONAL** validation steps and require explicit user opt-in: ask "Include derived validation steps for {NFR / Security / Observability}? [Y]es / [N]o" per category.

### Section Absence Handling (mandatory sections only)

**If both DoD and VM sections are present:**
- Parse each VM into a structured list: `[{id, description, bac_refs, type_tag}]`
- Parse the DoD into a list of criteria
- Parse optional v2 sections (NFR / Security / Observability / Out-of-Scope / Boundaries) if present
- Display: "Issue **{ISSUE_IDENTIFIER}** — {ISSUE_TITLE}"
- Display the number of VM items found and their list, and surface any derived validation candidates from v2 sections

**If one or both DoD/VM sections are absent:**
- HALT: "Issue **{ISSUE_IDENTIFIER}** does not contain a {missing_section} section."
- Ask: "Should I try to infer validation items from the issue content? [Y]es / [N]o"
- If Yes — analyze the issue, propose inferred VM items, wait for user validation
- If No — HALT: "Cannot continue without Validation Metier. Add the sections to the issue and re-launch."

---

## Validation Plan Checkpoint

Present the parsed VM items to the user before proceeding:

```
## Validation Plan

**Issue:** {ISSUE_IDENTIFIER} — {ISSUE_TITLE}
**Environment:** {ENVIRONMENT}
**VM items to validate:** {count}

{numbered list of VM items with descriptions}

Proceed with validation?
```

WAIT for user confirmation before proceeding to the next step.

---

## Rules

- HALT if the issue is not in the "to test" status
- HALT if the VM and DoD sections are absent (propose to infer ONLY with explicit user authorization)
- NEVER invent VM items — they come from the issue or the user
- NEVER auto-select an issue without user confirmation
