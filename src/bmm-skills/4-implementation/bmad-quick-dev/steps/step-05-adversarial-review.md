# Step 5: Adversarial Code Review

**Goal:** Construct diff of all changes, perform adversarial review, present findings.

---

## AVAILABLE STATE

From previous steps:
- `{baseline_commit}` - Git HEAD at workflow start (CRITICAL for diff)
- `{execution_mode}` - "tech-spec" or "direct"

---

## 1. Construct Diff

Build complete diff of all changes since workflow started.

### If `{baseline_commit}` is a Git commit hash:

**Tracked file changes:**
```bash
git diff {baseline_commit}
```

**New untracked files:**
Only include untracked files created during this workflow. For each, include full content.

### If `{baseline_commit}` is "NO_GIT":

Use best-effort diff construction:
- List all files modified during steps 2-4
- Show changes made (before/after or current state)
- Include new files with full content

Merge all changes into `{diff_output}`.

**Note:** Do NOT `git add` anything — this is read-only inspection.

---

## 2. Perform Adversarial Review

Review the `{diff_output}` from these perspectives:

1. **Correctness**: Does the code actually do what was requested? Logic errors? Off-by-one?
2. **Security**: Injection, auth bypass, data exposure, missing validation?
3. **Robustness**: Error handling, edge cases, null/empty states?
4. **Patterns**: Follows codebase conventions? Forbidden patterns used?
5. **Testing**: Adequate coverage? Missing edge case tests?
6. **Performance**: N+1 queries, unnecessary allocations, missing indexes?
7. **Fact-check**: Do all code comments accurately describe what the code does? Are all function/variable names semantically correct? Would a PR description based on these names and comments be truthful?
8. **ADR conformity** (if ADRs loaded): Does the implementation follow all active Architecture Decision Records? Any new patterns that contradict decided approaches? Any architectural choices that should have an ADR but don't?

If `.claude/workflow-knowledge/review-perspectives.md` exists, load it and apply those review perspectives instead.

---

## 3. Design Decisions Audit

List all design decisions made during implementation that were NOT specified by the user or tech-spec. For each:
- **What was decided** — the choice made
- **Why** — the reasoning
- **Alternatives** — what else could have been done

Present these as part of the findings — they are not defects, but decisions the user should be aware of and can challenge.

## 4. Process Findings

- If zero findings: HALT — this is suspicious. Re-analyze or request user guidance.
- Evaluate severity (Critical, High, Medium, Low) and validity (real, noise, undecided).
- Do NOT exclude findings based on severity or validity.
- Order findings by severity.
- Number the ordered findings (F1, F2, F3, etc.).
- Present findings as a table: ID, Severity, Validity, Description.

---

## NEXT STEP

With findings in hand, read fully and follow: `step-06-resolve-findings.md`.

---

**Next:** `./step-06-resolve-findings.md`
