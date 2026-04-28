---
type: 'subagent-workflow'
parent_workflow: 'bmad-dev-story'
parent_step: 'step-07-plan-approval.md'
agent_type: 'general-purpose'
---

# Subagent Workflow: Scope Completeness Check

**Goal:** Independently verify that a drafted implementation plan covers a story's full scope and surface oversights, gaps, and risks before the user approves the plan. Acts as the safety net between the plan author (who may have missed things) and the user.

**Spawned by:** `bmad-dev-story` step-07-plan-approval, between the plan draft and the `ExitPlanMode` call.

**Agent type:** `general-purpose` — deliberately not specialised, to maintain neutrality. The subagent has no shared context with the spawning thread.

---

## ANTI-DEVIATION CONTRACT — IMPARTIALITY GUARANTEED

This subagent is the **safety net** for plan completeness. Its value depends entirely on its independence from the plan author. The contract below MUST be respected in full.

### Inputs the subagent receives

The spawning prompt MUST contain ONLY these two fields:

- `story_path` — absolute path to the story spec file
- `plan_path` — absolute path to the drafted plan file

The subagent MUST NOT receive:

- A summary of the story scope (no "the story does X")
- A summary of the plan content (no "the plan implements Y")
- Any excerpt of either file
- Any hint about which areas are likely problematic
- References to this conversation's context

### Inputs the subagent MUST produce itself

- It MUST issue its own `Read` call on `story_path` to load the story
- It MUST issue its own `Read` call on `plan_path` to load the plan
- It MUST read enough of the codebase to validate file paths, existing patterns, and cross-references the plan claims
- It MUST NOT trust any claim in the plan without verifying against the codebase

### Forbidden behaviour

- DO NOT skip reading either file ("the prompt told me what's in it")
- DO NOT defer to the spawning thread's judgment on any finding
- DO NOT downgrade severity to be polite
- DO NOT remove findings because the plan "probably handles them"
- DO NOT echo the plan's structure as if it were verified

If the subagent finds itself with no spec to verify against (story file empty / unreadable), it MUST return a single BLOCKER finding ("Story file unreadable — cannot verify scope") and stop. It MUST NOT fabricate findings.

---

## EXECUTION SEQUENCE

### 1. Verify Inputs

```
Read({story_path})
Read({plan_path})
```

If either file is unreadable: return a BLOCKER and stop.

### 2. Build Coverage Matrix

Extract from the story:

- Definition of Done items
- Scope (Included / Excluded)
- Business Acceptance Criteria (BAC-1..N)
- Technical Acceptance Criteria (TAC-1..N)
- Validation Metier (VM-1..N)
- Numbered Tasks
- Files to Create / Modify

For EACH item, mark as one of:

- `COVERED` — the plan addresses it explicitly
- `PARTIAL` — the plan addresses some but not all aspects
- `MISSING` — the plan does not address it
- `N/A` — the item is meta (e.g., DoD references) and doesn't need direct mapping

### 3. Detect Oversights

Search the codebase for things the plan SHOULD have considered:

- **Cross-references**: if the plan renames an identifier (e.g., a key, a perspective name), `grep -rn "{old name}" src/` to find every site that breaks under the rename
- **Sibling files**: if the plan modifies a file in a directory, check whether sibling files in the same directory follow the same pattern and may need parallel updates
- **Referenced files**: if the plan claims to reference an existing file, read it and verify the reference is correct
- **Test artefacts**: changes to source structure may break tests (`test/`, `*.spec.*`, `*.test.*`)
- **Documentation**: `docs/`, `README.md`, `CLAUDE.md`, `module-help.csv` may mention the changed concepts
- **Tooling**: validators, linters, build scripts may need updates
- **Tracker**: if the project uses a tracker file, the story may need an entry

### 4. Identify Risks Not Addressed

For each design choice in the plan, ask:

- **Backwards compatibility** — will this break consumers / parsers / downstream tools?
- **Performance** — does this add a synchronous step to a hot path?
- **Naming clarity** — will the new identifier confuse maintainers?
- **Migration path** — how do existing instances of the system migrate?
- **Rollback** — if the change goes wrong, can it be reverted cleanly?

### 5. Return Structured Report

Output format (Markdown, returned as the subagent's final message):

```markdown
## 1. Coverage matrix

| Item | Status | Note |
|------|--------|------|
| Task 1 | COVERED | Phase 1 |
| Task 2 | PARTIAL | Plan covers file but not the test |
| BAC-1 | COVERED | via Task 5 |
| ...

## 2. Oversights detected

For each (numbered):
- **Title**
- **Evidence** (file:line or grep result)
- **Severity**: BLOCKER / MAJOR / MINOR / INFO
- **Proposed action**: concrete change to the plan

## 3. Risks not addressed by the plan

For each (numbered):
- **Risk**
- **Likelihood/Impact**: short
- **Mitigation suggested**

## 4. Verdict

- **APPROVED** if no BLOCKER and at most 2 MAJOR
- **NEEDS REVISION** otherwise

One-sentence justification.
```

The report is returned verbatim to the spawning thread for presentation to the user.

---

## CONSTRAINTS

**DO:**

- Issue your own `Read` calls to load the story and plan independently
- Verify cross-references with `grep` against the codebase
- Return a structured Markdown report with the four sections above
- Cite evidence (file:line or grep result) for every finding
- Be ruthlessly thorough — the user explicitly asked for an impartial check

**DO NOT:**

- Trust the spawning prompt for content beyond the two file paths
- Accept the plan's claims without verification
- Skip findings to be polite
- Fabricate findings when the inputs are unreadable
- Reference any conversation context outside this contract
- Compute or recommend a final implementation decision — that belongs to the user

---

## EXAMPLE INVOCATION (from step-07-plan-approval.md)

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Impartial scope-completeness audit',
  prompt: |
    Read and apply this contract IN FULL: ~/.claude/skills/bmad-dev-story/subagent-workflows/scope-completeness.md

    Inputs:
      story_path: '{ABSOLUTE_PATH_TO_STORY_FILE}'
      plan_path: '{ABSOLUTE_PATH_TO_PLAN_FILE}'

    Return the structured Markdown report defined in the contract. No preamble, no postamble.
)
```

The spawning thread MUST NOT include a summary of the story or the plan in the prompt. Only the two paths.
