---
type: 'subagent-workflow'
parent_workflow: 'bmad-dev-story'
parent_step: 'step-12-traceability.md'
agent_type: 'general-purpose'
---

# Subagent Workflow: Impartial Scope-Completeness Audit (post-implementation)

**Goal:** Independently audit whether an implementation actually delivers a story's full scope and surface any oversights, missing items, scope creep, or stale references — last safety net before push. Acts as an impartial second pair of eyes on top of the same-thread self-review (step-11) and traceability (step-12 §1-5).

**Spawned by:** `bmad-dev-story` step-12-traceability §6, after the local traceability matrix passes and before step-13 (push & MR).

**Agent type:** `general-purpose` — deliberately not specialised, to maintain neutrality. The subagent has no shared context with the spawning thread.

---

## ANTI-DEVIATION CONTRACT — IMPARTIALITY GUARANTEED

This subagent is the **last safety net** for scope completeness before push. Its value depends entirely on its independence from the dev thread that produced the implementation. The contract below MUST be respected in full.

### Inputs the subagent receives

The spawning prompt MUST contain ONLY these three fields:

- `story_path` — absolute path to the story spec file (markdown). For API-based trackers, the spawner is responsible for dumping the issue body to a local file first and passing that path.
- `worktree_path` — absolute path to the worktree where the implementation lives.
- `baseline_commit` — git commit SHA representing the pre-implementation state (`git merge-base HEAD origin/main`).

The subagent MUST NOT receive:

- A summary of the story scope (no "the story does X")
- A summary of the implementation (no "the diff implements Y")
- A list of changed files dictated by the spawner
- Any excerpt of either the story or the diff
- Any hint about which areas are likely problematic
- The traceability report from step-12 §1-5 (impartiality requires the subagent to compute its own coverage matrix)
- References to the spawning conversation's context

### Inputs the subagent MUST produce itself

- Issue its own `Read` call on `story_path` to load the spec
- Issue its own `git diff {baseline_commit}..HEAD --stat` and `git diff {baseline_commit}..HEAD --name-only` from `worktree_path` to get the changed file list
- Read the actual changed files (or at least their diffs) to verify implementation
- Grep the codebase for cross-references the implementation may have missed
- MUST NOT trust any claim in the spawning prompt beyond the three input paths/SHA

### Forbidden behaviour

- DO NOT skip reading the story or the diff ("the prompt told me what's in it")
- DO NOT defer to the spawning thread's judgment on any finding
- DO NOT trust the traceability report — recompute coverage independently
- DO NOT downgrade severity to be polite
- DO NOT remove findings because the dev "probably handles them"
- DO NOT echo the diff's structure as if it were verified

If the subagent finds itself with no spec to verify against (story file empty / unreadable), it MUST return a single BLOCKER finding ("Story file unreadable — cannot audit scope") and stop. It MUST NOT fabricate findings.

---

## EXECUTION SEQUENCE

### 1. Verify Inputs

```
Read({story_path})
cd {worktree_path} && git diff --stat {baseline_commit}..HEAD
cd {worktree_path} && git diff --name-only {baseline_commit}..HEAD
```

If the story file is unreadable: return a BLOCKER and stop.

If the diff is empty: return a BLOCKER ("No implementation found — empty diff against baseline") and stop.

### 2. Build Independent Coverage Matrix

Extract from the story (story-spec v2 (monolithic) or v3 (bifurcation) schema — sections per `bmad-shared/spec-completeness-rule.md`):

- Definition of Done items (Feature DoD + Non-regression DoD)
- Scope (Included / Excluded)
- **Out-of-Scope register (OOS-1..N)** — items the implementation MUST NOT deliver
- Business Acceptance Criteria (BAC-1..N) in Given / When / Then
- Technical Acceptance Criteria (TAC-1..N) in EARS notation (Ubiquitous / Event-driven / State-driven / Optional / Unwanted)
- Validation Metier (VM-1..N)
- Numbered Tasks (including [CI/CD], [INFRA], [OBS], [SEC] prefixed)
- Files to Create / Modify (if listed)
- Mandatory guardrails
- **NFR Registry items marked PRESENT or MISSING with remediation tasks**
- **Security Gate items marked FAIL with remediation tasks**
- **Observability Requirements** (mandatory log events, metrics, traces, alerts, dashboards, SLOs)
- **Boundaries Triple** — Always Do / Ask First / Never Do (used to flag boundary violations in the diff)
- **Risks register** — HIGH-impact risks with mitigation in scope

For EACH item, mark as one of:

- `IMPLEMENTED` — the diff contains code that delivers it (cite file:line)
- `TESTED` — the diff also contains a test exercising it
- `PARTIAL` — partially delivered (cite what's missing)
- `MISSING` — not present in the diff
- `SCOPE_CREEP` — present in the diff but NOT in the story (cross-check against Out-of-Scope register; if matches an OOS-N item → BLOCKER severity)
- `BOUNDARY_VIOLATION` — present in the diff and matches a "Never Do" boundary item (BLOCKER severity)
- `N/A` — meta item (e.g., DoD references) requiring no direct mapping

For the diff, also list any changed files NOT mapped to a story item — these are candidate scope creep, especially if they touch areas listed in Out-of-Scope.

**TAC pattern coverage check:**
For each TAC, verify the test scaffold matches the EARS pattern declared in the spec:
- Ubiquitous → "always" assertion across many fixtures
- Event-driven → setup + trigger + assert
- State-driven → state-machine test (pre-state, transition, post-state)
- Optional → feature-flag conditional test
- Unwanted → negative test + alert assertion

Mismatch (e.g., Event-driven TAC tested with a single-fixture happy-path test) → MINOR finding.

### 3. Detect Oversights

Search the codebase for things the IMPLEMENTATION should have addressed:

- **Cross-references**: if the diff renames an identifier (e.g., a key, a perspective name, an enum), `grep -rn "{old name}"` to find every site that breaks under the rename
- **Sibling files**: if the diff modifies a file in a directory, check whether sibling files in the same directory follow the same pattern and may need parallel updates
- **Referenced files**: when the story claims to reference an existing file or workflow, verify the reference is correct against the codebase
- **Test artefacts**: changes to source structure may break existing tests (`test/`, `*.spec.*`, `*.test.*`)
- **Documentation drift**: `docs/`, `README.md`, `CLAUDE.md`, `module-help.csv` may mention concepts changed by the diff
- **Tooling**: validators, linters, build scripts may need updates the dev forgot
- **Tracker entries**: if the project uses a tracker file (e.g., `sprint-status.yaml`), verify the story is reflected there if needed
- **Migration notes**: if the diff renames a public-ish key (YAML field, enum, API), is there a migration note documented in the diff itself?
- **NFR remediation**: if the spec NFR Registry has any MISSING/PARTIAL category, verify a remediation task delivered the target — code present at the right place + measurement instrumented
- **Security remediation**: if the spec Security Gate has any FAIL row, verify the remediation in the diff (code change + audit log + test)
- **Observability instrumentation**: for each mandatory log event / metric / alert declared in spec, verify the diff implements it (structured log call with required fields, metric registration, alert config)
- **Boundary Never-Do violations**: scan the diff for any action listed under "🚫 Never Do" in the spec Boundaries section (committed secrets, modified migrations already run, removed failing tests, `--no-verify`, etc.)

### 4. Identify Risks Not Addressed

For each design choice visible in the diff, ask:

- **Backwards compatibility** — will this break consumers / parsers / downstream tools?
- **Performance** — does the change add a synchronous step to a hot path?
- **Naming clarity** — will the new identifier confuse maintainers? Is there a parenthetical "(formerly X)" for transition?
- **Migration path** — how do existing instances of the system migrate?
- **Rollback** — if the change goes wrong, can it be reverted cleanly?
- **Failed Story-Tasks**: are there tasks marked complete in the story but with no clear implementation in the diff?

### 5. Return Structured Report

Output format (Markdown, returned as the subagent's final message):

```markdown
## 1. Coverage matrix

| Item | Status | Evidence |
|------|--------|----------|
| Task 1 | IMPLEMENTED + TESTED | `path/file.ext:42`, `path/file.spec.ext:18` |
| Task 2 | PARTIAL | code present at `path/file.ext:30`, no test |
| BAC-1 | IMPLEMENTED + TESTED | … |
| Unmapped diff entry | SCOPE_CREEP | `path/extra.ext` not referenced by any task/AC |
| ...

## 2. Oversights detected

For each (numbered):
- **Title**
- **Evidence** (file:line or grep result)
- **Severity**: BLOCKER / MAJOR / MINOR / INFO
- **Proposed action**: concrete change to the implementation

## 3. Risks not addressed by the implementation

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

- Issue your own `Read` calls to load the story and your own `git diff` calls to load the implementation
- Verify cross-references with `grep` against the codebase
- Build the coverage matrix yourself — do not rely on any traceability report
- Cite evidence (file:line or grep result) for every finding
- Be ruthlessly thorough — the user explicitly asked for an impartial check at the end of the workflow

**DO NOT:**

- Trust the spawning prompt for content beyond `story_path` / `worktree_path` / `baseline_commit`
- Accept the implementation's structure without verification
- Skip findings to be polite
- Fabricate findings when the inputs are unreadable
- Reference any conversation context outside this contract
- Recommend a final implementation decision — that belongs to the user

---

## EXAMPLE INVOCATION (from step-12-traceability.md §6)

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Impartial scope-completeness audit (post-implementation)',
  prompt: |
    Read and apply this contract IN FULL: ~/.claude/skills/bmad-dev-story/subagent-workflows/scope-completeness.md

    Inputs:
      story_path: '{ABSOLUTE_PATH_TO_STORY_FILE_OR_TRACKER_DUMP}'
      worktree_path: '{WORKTREE_PATH}'
      baseline_commit: '{BASELINE_COMMIT}'

    Return the structured Markdown report defined in the contract. No preamble, no postamble.
)
```

The spawning thread MUST NOT include a summary of the story or the implementation in the prompt. Only the three inputs.
