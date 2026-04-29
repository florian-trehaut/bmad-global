---
type: 'subagent-workflow'
parent_workflow: 'bmad-troubleshoot'
parent_step: 'step-07-ship.md'
agent_type: 'general-purpose'
---

# Subagent Workflow: Impartial Scope-Completeness Audit (post-fix, pre-push)

**Goal:** Independently audit whether a bug fix actually addresses the diagnosed root cause AND ONLY that — surface missing items, scope creep ("while I'm here"), unaddressed ACs, or fabricated test coverage. Last safety net before push, on top of the same-thread condensed self-review (step-07 §2).

**Spawned by:** `bmad-troubleshoot` step-07-ship §3, after the inline self-review and before §4 push.

**Agent type:** `general-purpose` — deliberately not specialised, to maintain neutrality. The subagent has no shared context with the spawning thread.

---

## ANTI-DEVIATION CONTRACT — IMPARTIALITY GUARANTEED

This subagent is the **last safety net** for fix scope before push. Bug fixes are particularly prone to scope creep — when reading code to find a bug, the dev (and the LLM) sees other things they want to clean up. The contract below MUST be respected in full.

### Inputs the subagent receives

The spawning prompt MUST contain ONLY these three fields:

- `issue_path` — absolute path to a local file containing the tracker issue body (diagnosis, ACs, fix plan, VM items). The spawner is responsible for fetching the issue from the tracker and dumping it to a local file before invoking this subagent.
- `worktree_path` — absolute path to the worktree where the fix lives.
- `baseline_commit` — git commit SHA representing the pre-fix state (`git merge-base HEAD origin/main`).

The subagent MUST NOT receive:

- A summary of the bug or root cause (no "the bug was caused by X")
- A summary of the fix (no "the diff fixes Y by doing Z")
- A list of changed files dictated by the spawner
- Any excerpt of either the issue or the diff
- Any hint about which areas are likely problematic
- The condensed self-review verdict from step-07 §2 (impartiality requires the subagent to compute its own assessment)
- References to the spawning conversation's context

### Inputs the subagent MUST produce itself

- Issue its own `Read` call on `issue_path` to load the diagnosis + ACs + fix plan + VM items
- Issue its own `git diff {baseline_commit}..HEAD --stat` and `git diff {baseline_commit}..HEAD --name-only` from `worktree_path` to get the changed file list
- Read the actual changed files (or at least their diffs) to verify the fix
- Grep the codebase for cross-references and similar patterns (the diagnosis section may have flagged "Similar Patterns")
- MUST NOT trust any claim in the spawning prompt beyond the three input paths/SHA

### Forbidden behaviour

- DO NOT skip reading the issue or the diff ("the prompt told me what's in it")
- DO NOT defer to the spawning thread's judgment on any finding
- DO NOT trust the condensed self-review — re-evaluate scope discipline independently
- DO NOT downgrade severity to be polite
- DO NOT remove findings because the dev "probably handles them"
- DO NOT echo the diff's structure as if it were verified
- DO NOT accept "while I'm here" cleanups as in-scope unless the issue body explicitly authorises them

If the subagent finds itself with no spec to verify against (issue file empty / unreadable), it MUST return a single BLOCKER finding ("Issue file unreadable — cannot audit scope") and stop. It MUST NOT fabricate findings.

---

## EXECUTION SEQUENCE

### 1. Verify Inputs

```
Read({issue_path})
cd {worktree_path} && git diff --stat {baseline_commit}..HEAD
cd {worktree_path} && git diff --name-only {baseline_commit}..HEAD
```

If the issue file is unreadable: return a BLOCKER and stop.

If the diff is empty: return a BLOCKER ("No fix found — empty diff against baseline") and stop.

### 2. Build Independent Coverage Matrix

Extract from the issue body (story-spec v2 (monolithic) or v3 (bifurcation) schema where applicable — see `~/.claude/skills/bmad-shared/spec-completeness-rule.md`):

- **Root Cause** (one paragraph from the Diagnosis section)
- **Causal Chain** (Five Whys or equivalent)
- **Definition of Done** items (product DoD, NOT technical DoD)
- **Acceptance Criteria**:
  - **BACs (Business — Given/When/Then)** — each BAC describes the user-observable correction
  - **TACs (Technical — EARS notation)** — each TAC describes the system-behaviour correction (Ubiquitous / Event-driven / State-driven / Optional / Unwanted)
- **Out-of-Scope register (OOS-N)** — items the fix MUST NOT touch (typically: similar patterns flagged for awareness only)
- **Fix Plan** numbered tasks (each with file path + specific change)
- **Validation Metier** items: VM-1..N (staging tests)
- **Boundaries Triple — Never Do** — actions the fix must refuse (committed secrets, modified migrations, removed failing tests, `--no-verify`)
- **Risks register** — risks introduced by the fix (regressions, new failure modes); HIGH-impact risks must have mitigation in the diff
- **Similar Patterns** (codebase locations flagged for awareness, NOT to fix — overlap with Out-of-Scope register)

For EACH item, mark as one of:

- `IMPLEMENTED` — the diff contains code that delivers it (cite file:line)
- `TESTED` — the diff also contains a test exercising it (regression test reproducing the bug)
- `PARTIAL` — partially delivered (cite what's missing)
- `MISSING` — not present in the diff
- `SCOPE_CREEP` — present in the diff but NOT in the fix plan / ACs / DoD
- `OUT_OF_SCOPE_CORRECTLY` — flagged in "Similar Patterns" section AND not modified by the diff (this is the correct behaviour)
- `OUT_OF_SCOPE_VIOLATION` — flagged in "Similar Patterns" section AND modified by the diff (the dev fixed similar patterns the issue body said NOT to fix in this MR)
- `N/A` — meta item (e.g., DoD references) requiring no direct mapping

For the diff, list any changed files NOT mapped to a task/AC — these are candidate scope creep.

### 3. Detect Bug-Fix-Specific Oversights

Search the codebase for things the FIX should have addressed:

- **Regression test exists?** A bug fix without a test that reproduces the bug is incomplete. If no test in the diff demonstrably fails on `baseline_commit`, flag MAJOR.
- **Test reproduces the actual bug, not happy path?** Read the new test — does it exercise the failure mode described in the diagnosis? Or does it just test a generic "happy path" that would pass before the fix?
- **Symptom vs root cause:** Does the fix address the root cause from the Causal Chain, or just the proximate symptom? If the fix patches a side-effect rather than the cause, flag MAJOR.
- **Cross-references:** if the fix renames an identifier, `grep -rn "{old name}"` to find every site that breaks under the rename.
- **Sibling files / similar patterns:** if "Similar Patterns" was flagged in the diagnosis, confirm those locations were NOT modified (out-of-scope) — modifying them is a violation, not modifying them is correct.
- **Fallback / silent default introduced:** A bug fix that adds `|| default`, `?? fallback`, or wraps an error in `try/catch + log` to make the symptom disappear is hiding the bug, not fixing it. Cross-reference the `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md` rule. Flag BLOCKER.
- **Diagnosis evidence still valid:** read the diagnosis evidence trail (logs, DB queries) — does the fix's intervention point match where the evidence pointed?
- **VM items addressable:** for each VM item, is there a way to verify it post-deploy? Or is the VM hand-wavy ("ça marche")?

### 4. Identify Risks Not Addressed

For each design choice visible in the diff, ask:

- **Backwards compatibility** — will this change break consumers (downstream services, parsers, mobile apps with old client)?
- **Migration data** — if the fix changes how data is interpreted, are existing records still valid? Is there a backfill plan?
- **Rollback safety** — if the fix goes wrong in production, can it be reverted cleanly without leaving state corruption behind?
- **Failure mode change** — does the fix turn a loud failure (exception, alert) into a silent one (return null, log warning)? That's worse than the original bug.
- **Test fragility** — does the regression test rely on timing, ordering, or specific fixture data that future test additions will perturb?
- **Failed Fix-Plan tasks**: are there tasks marked complete (`[x]`) in the issue body but with no clear implementation in the diff?

### 5. Return Structured Report

Output format (Markdown, returned as the subagent's final message):

```markdown
## 1. Coverage matrix

| Item | Status | Evidence |
|------|--------|----------|
| Root Cause: {one-line} | IMPLEMENTED | `path/file.ext:42` (intervention matches causal chain) |
| BAC-1 | IMPLEMENTED + TESTED | code: `path/fix.ext:30`, test: `path/fix.spec.ext:18` |
| TAC-1 | PARTIAL | code at `path/file.ext:30`, no test reproducing the failure mode |
| Fix-Plan Task 1 | MISSING | task says "modify config X" but no config change in diff |
| VM-1 | N/A | meta — verifiable post-deploy |
| Similar pattern at `path/other.ext:55` | OUT_OF_SCOPE_CORRECTLY | flagged in diagnosis, not modified — correct |
| Similar pattern at `path/another.ext:90` | OUT_OF_SCOPE_VIOLATION | flagged as "do not fix here", but modified by diff at line 92 |
| Unmapped diff entry | SCOPE_CREEP | `path/refactor.ext` not referenced by any task/AC/DoD |
| ...

## 2. Oversights detected

For each (numbered):
- **Title**
- **Evidence** (file:line or grep result)
- **Severity**: BLOCKER / MAJOR / MINOR / INFO
- **Proposed action**: concrete change to the implementation

Examples of common bug-fix oversights:
- "Regression test does not actually reproduce the bug — it tests the happy path"
- "Fix introduces a `|| default` that masks future occurrences of the same bug"
- "Diff modifies similar-pattern files the diagnosis explicitly flagged as out-of-scope"
- "Root cause is in module A, but fix is in module B downstream — symptom patch, not root-cause fix"

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

- Issue your own `Read` calls to load the issue and your own `git diff` calls to load the fix
- Verify cross-references and similar-pattern files with `grep` against the codebase
- Build the coverage matrix yourself — do not rely on the inline self-review
- Cite evidence (file:line or grep result) for every finding
- Be ruthlessly thorough — bug fixes are the highest-risk surface for scope creep AND for symptom-vs-root-cause confusion

**DO NOT:**

- Trust the spawning prompt for content beyond `issue_path` / `worktree_path` / `baseline_commit`
- Accept the implementation's structure without verification
- Skip findings to be polite
- Fabricate findings when the inputs are unreadable
- Reference any conversation context outside this contract
- Recommend a final implementation decision — that belongs to the user

---

## EXAMPLE INVOCATION (from step-07-ship.md §3)

```
Agent(
  subagent_type: 'general-purpose',
  description: 'Impartial scope-completeness audit (post-fix, pre-push)',
  prompt: |
    Read and apply this contract IN FULL: ~/.claude/skills/bmad-troubleshoot/subagent-workflows/scope-completeness.md

    Inputs:
      issue_path: '{ABSOLUTE_PATH_TO_ISSUE_DUMP_FILE}'
      worktree_path: '{WORKTREE_PATH}'
      baseline_commit: '{BASELINE_COMMIT}'

    Return the structured Markdown report defined in the contract. No preamble, no postamble.
)
```

The spawning thread MUST NOT include a summary of the bug, the diagnosis, or the fix in the prompt. Only the three inputs.
