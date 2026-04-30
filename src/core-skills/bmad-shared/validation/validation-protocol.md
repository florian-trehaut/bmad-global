# Validation Protocol — Shared Rules for bmad-validation-* Workflows

**This document is loaded JIT by all bmad-validation-* workflow skills.** It merges three previously separate documents into a single canonical source:

- §[Intake](#intake) — issue discovery, loading, VM/DoD parsing (formerly `validation-intake-protocol.md`)
- §[Verdict](#verdict) — verdict compilation, tracker comment composition, status updates (formerly `validation-verdict-protocol.md`)
- §[Proof Principles](#proof-principles) — universal proof rules (formerly `validation-proof-principles.md`)

Each section is self-contained and may be referenced by anchor (`validation/validation-protocol.md#intake`, `…#verdict`, `…#proof-principles`).

---

## Intake

**Loaded by step-01 of every bmad-validation-\* skill.** Standardizes issue discovery, loading, and VM/DoD parsing baseline. Each validation skill's step-01 loads this section as baseline rules, then adds its domain-specific extensions (environment selection, worktree setup timing).

### Issue Discovery

#### If the user provided an identifier

Store `ISSUE_IDENTIFIER`, proceed to issue loading.

#### If no identifier provided

Query the tracker (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: List issues
- Team: `{TRACKER_TEAM}`
- Status: `{TRACKER_STATES.to_test}`
- Limit: 20

Store results in `TO_TEST_CANDIDATES[]`.

**If no candidates:** "No issues in 'To Test' status found in team {TRACKER_TEAM}. Nothing to validate." — End of workflow.

**If candidates found:** Present a numbered table with Issue, Title, Assignee columns. WAIT for user selection.

### Issue Loading

Fetch the issue from the tracker:
- Operation: Get issue
- Identifier: `ISSUE_IDENTIFIER`

**Status verification:** The issue MUST be in "To Test" status (matching `TRACKER_STATES.to_test`). If different status, HALT: "Issue {ISSUE_IDENTIFIER} is in status '{status}', not in 'To Test'. Business validation only applies to issues in 'To Test'."

Store `ISSUE_ID`, `ISSUE_TITLE`, `ISSUE_DESCRIPTION`.

### VM and DoD Parsing (story-spec v2 aware)

Search in `ISSUE_DESCRIPTION`:

**Definition of Done (product)** — section starting with a heading containing "Definition of Done" or "DoD". (Mandatory)

**Validation Metier** — section starting with a heading containing "Validation Metier", "Validation Métier", or "VM". Each item starts with `VM-N` or a checkbox `- [ ]`. (Mandatory)

#### Story-spec v2 optional sections (additive parsing — none halts the workflow)

If the issue follows the **story-spec v2 (monolithic) or v3 (bifurcation) schema** (`~/.claude/skills/bmad-shared/spec/spec-completeness-rule.md`), the following additional sections may be parsed for richer validation:

**NFR Registry** — section heading "NFR Registry" or "NFRs". Parse the table for any row marked PRESENT/PARTIAL with a measurable target (Performance latency, Scalability throughput, etc.). For each measurable target, optionally generate a derived validation step (e.g. perf measurement during the test environment session). Marked as **`vm_derived_nfr`** in the structured list.

**Security Gate** — section heading "Security Gate". If verdict is FAIL or items are listed with FAIL status, parse the remediation tasks. For compliance-heavy stories (GDPR, HIPAA, SOC2, PCI-DSS), optionally generate a derived audit-trail validation step. Marked as **`vm_derived_security`**.

**Observability Requirements** — section heading "Observability Requirements". Parse mandatory log events / alerts / dashboards. Optionally generate a derived dashboard-check validation step (open dashboard, verify panels populated). Marked as **`vm_derived_observability`**.

**Out-of-Scope register** — section heading "Out of Scope". Use this to verify that the test session does NOT inadvertently exercise out-of-scope flows (would indicate scope creep in the implementation).

**Boundaries Triple — Never Do** — section heading "Boundaries". Validation-side check: ensure the test environment did not expose any "Never Do" item (e.g. PII in error messages, secrets in logs).

These derived items are presented as **OPTIONAL** validation steps and require explicit user opt-in: ask "Include derived validation steps for {NFR / Security / Observability}? [Y]es / [N]o" per category.

#### Section Absence Handling (mandatory sections only)

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

### Validation Plan Checkpoint

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

### Intake Rules

- HALT if the issue is not in the "to test" status
- HALT if the VM and DoD sections are absent (propose to infer ONLY with explicit user authorization)
- NEVER invent VM items — they come from the issue or the user
- NEVER auto-select an issue without user confirmation

---

## Verdict

**Loaded by the verdict step of every bmad-validation-\* skill.** Standardizes verdict compilation, tracker comment composition, status updates, and final summary.

### Verdict Compilation

Analyze `VM_RESULTS`:

- Count PASS and FAIL
- **Verdict = PASS** if and only if ALL VM items are PASS
- **Verdict = FAIL** if AT LEAST ONE VM item is FAIL

The verdict is BINARY. No partial pass, no "pass with caveats."

### Tracker Comment Composition

Load the skill-local `../data/tracker-comment-template.md`.

Use the PASS or FAIL template according to the verdict.

Fill in all placeholders:
- `{issue_identifier}`: issue identifier
- `{environment}`: environment used
- `{date}`: today's date
- `{user_name}`: `USER_NAME` from workflow-context.md
- `{dod_summary}`: DoD summary
- `{vm_rows}`: one row per VM with id, description, type, verdict, proof
- If FAIL: `{failed_vm_details}` with the detail of each failed VM

### User Confirmation Flow

**If PASS:**
"All VM items are validated. I will post this comment and move the issue to **Done**. Do you confirm? [Y]es / [N]o"

**If FAIL:**
"**{fail_count}/{total_count}** VM items failed. I will post this comment. The issue will remain in its current status. Do you confirm? [Y]es / [N]o"

WAIT for confirmation before posting.

### Tracker Operations

#### Post Comment

Post a comment on the issue (per `~/.claude/skills/bmad-shared/protocols/tracker-crud.md`):
- Operation: Create comment
- Issue: `ISSUE_ID`
- Body: `{composed_comment}`

**If API failure:** HALT — "Error posting the tracker comment. Error: {error}. The comment is displayed above, you can copy it manually."

#### Update Status

**If PASS:**
- Update issue status to `{TRACKER_STATES.done}`
- Display: "Issue **{ISSUE_IDENTIFIER}** moved to **Done**."

**If FAIL:**
- Do NOT change the status (stays in current status)
- Display: "Issue **{ISSUE_IDENTIFIER}** remains in current status. Fix the failed VM items and re-launch validation."

### Worktree Cleanup

Remove the worktree created during the workflow:

```bash
git worktree remove {WORKTREE_PATH} --force
```

If removal fails, log a warning but do not HALT — this is non-blocking.

### Final Summary Banner

```
======================================
  VALIDATION {DOMAIN} — {PASS|FAIL}
  Issue: {ISSUE_IDENTIFIER}
  Env: {ENVIRONMENT}
  VM: {pass_count}/{total_count} passed
  Status: {new_status}
======================================
```

Where `{DOMAIN}` is the skill's domain name (Metier, Desktop, Frontend, etc.).

### Verdict Rules

- The verdict is BINARY: ALL PASS = PASS / ANY FAIL = FAIL
- NEVER move to "Done" an issue with a failed VM item
- NEVER post a comment without the proof of each VM item
- Confirm with the user before changing the issue status

---

## Proof Principles

**Loaded by every bmad-validation-\* workflow skill.** Defines the universal proof principles that apply regardless of the project domain (backend, frontend, desktop, mobile, etc.).

Each validation skill maintains its own `data/proof-standards.md` with domain-specific VALID proof types. This section defines what is universally INVALID and the behavioral rules that govern all validation.

### The Cardinal Principle

**In case of doubt, FAIL.**

Never validate by optimism. Never validate by absence of evidence to the contrary. Only validate by positive proof.

### What Constitutes Proof

**Only valid proof = result of a real action on the target environment.**

Proof is an artifact captured DURING the execution of the validation, not a priori reasoning. Code analysis can inform WHAT to test, but it can never BE the test.

Each validation skill defines its own valid proof types in `data/proof-standards.md`. This section defines what is universally REJECTED.

### Universally Invalid Proof Types

These are NEVER acceptable as proof in ANY validation skill, regardless of domain:

| Invalid proof | Why it is rejected |
|--------------|-------------------|
| "I read the code and it does X" | Code can have bugs not visible from reading |
| "Logically, it should work" | Reasoning does not replace observation |
| "The code hasn't changed since last time" | The environment may have changed |
| "The CI pipeline is green" | CI tests code, not real environment behavior |
| "Static analysis / linting passes" | Style/pattern checks prove nothing about behavior |
| "The code compiles without errors" | Compilation proves syntax, not behavior |

### Anti-Technical-Validation

**You are a BUSINESS validator, not a technical reviewer.**

The goal is to prove that the BUSINESS OUTCOME works in real conditions, not that the code is technically correct. The following approaches are NEVER valid:

- Inspecting source code to verify behavior — NO
- Comparing template/component source between versions — NO
- Reading compiled output (HTML, CSS, JS bundles) — NO
- Verifying function signatures or type definitions — NO
- "The function handles this case based on the code" — NO

**Rule:** Only executed output from the real environment (or a real test framework exercising the exact behavior) constitutes proof.

### Anti-Rationalization

**When a result does NOT match the expected outcome, FAIL IMMEDIATELY. No second chance, no explanation.**

Forbidden behaviors:
- "This might be due to [lag/cache/timing]" — NO. The result diverges = FAIL.
- "Let's verify with a different [item/input/sample]" — NO. The first test failed = FAIL.
- "It's possibly because..." — NO. You are not here to find excuses.
- "Let's try a more recent case" — NO. If the first case fails, the feature does not work universally.
- Changing test parameters to obtain a positive result — FORBIDDEN.
- Testing a second sample after a first failure — FORBIDDEN.

**Rule:** ONE non-conforming result is enough for FAIL. You are not looking for confirmation of success — you are looking for the first proof of failure. As soon as it appears, the VM is done.

### Proof Requirements

1. Each VM MUST have at least one valid proof
2. A VM without proof = **automatic FAIL**
3. A VM with only invalid proofs = **automatic FAIL**
4. In case of doubt about the validity of a proof, consider it invalid
5. **ONE non-conforming result = immediate FAIL** — the first test is authoritative
