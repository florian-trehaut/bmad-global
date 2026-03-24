# Step 1: Load Context & Requirements

## STEP GOAL

Gather acceptance criteria, test directory structure, and supporting artifacts for traceability analysis. Determine the gate type.

## RULES

- Acceptance criteria can come from a story file, epic, PRD, or inline user input
- If no acceptance criteria are available by any method, **HALT** and request them
- Test directory must exist and contain test files — if empty, **HALT** and report
- Load whatever supporting artifacts exist (test design, tech spec, PRD) — do not fail if optional artifacts are missing
- All loaded content must come from actual files — never fabricate

## SEQUENCE

### 1. Determine gate type

If the user has not specified, ask:

> "What gate type? **[S] Story** (single story), **[E] Epic** (full epic), **[R] Release** (release candidate), **[H] Hotfix** (hotfix validation)"

Set `GATE_TYPE` accordingly. Default: `story`.

WAIT for user response if not already specified.

### 2. Load acceptance criteria

**If user specifies a story or requirement source:**

Read the file or tracker issue. Extract all acceptance criteria (ACs). Each AC gets an ID (e.g., `AC-01`, `AC-02`).

**If user provides inline requirements:**

Number them as `AC-01`, `AC-02`, etc.

**If gate type is epic or release:**

Gather ACs from all stories/requirements in scope. Group by story/feature.

**HALT if no ACs found:** "No acceptance criteria available. Provide a story file, tracker issue, or inline requirements."

### 3. Identify test directory

Locate the test directory. Check in order:
1. User-specified path
2. `tests/` at project root
3. `test/` at project root
4. `__tests__/` at project root
5. `spec/` at project root
6. Co-located test files (`.test.*`, `.spec.*` patterns next to source)

Set `TEST_DIR` to the discovered path.

**HALT if no test files found anywhere:** "No test directory or test files found. Cannot perform traceability analysis."

### 4. Load supporting artifacts (optional, do not fail)

If available, read:
- **Test design document** (test-design.md, test plan, etc.) — provides priority classifications
- **Tech spec** — provides implementation context
- **PRD** — provides broader requirements context

Summarize what was found.

### 5. CHECKPOINT

Present to the user:

> **Gate type:** {GATE_TYPE}
> **Acceptance criteria loaded:** {count} ACs from {source}
> **Test directory:** {TEST_DIR}
> **Supporting artifacts:**
> - Test design: {found or "not found"}
> - Tech spec: {found or "not found"}
> - PRD: {found or "not found"}

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-02-discover.md`
