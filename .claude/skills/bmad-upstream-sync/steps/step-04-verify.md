# Step 3: Verify Merge Result

## STEP GOAL

Verify the merge is correct: no broken files, no lost content, fork identity preserved, quality gate passes.

## RULES

- Do NOT skip verification even if the merge was clean
- Fork identity checks are MANDATORY — verify our enhancements survived
- Any quality gate failure must be fixed before proceeding

## SEQUENCE

### 1. Verify Merge State

```bash
git status
git log --oneline -3
```

Confirm: merge commit exists, working tree clean.

### 2. Fork Identity Verification

These checks verify our fork's distinctiveness survived the merge:

```bash
# Package name preserved
grep '"name"' package.json

# Our shared rules still exist
ls src/core-skills/bmad-shared/worktree-lifecycle.md
ls src/core-skills/bmad-shared/project-root-resolution.md
ls src/core-skills/bmad-shared/no-fallback-no-false-data.md

# Our workflow-context not overwritten
ls .claude/workflow-context.md

# Step directories use our convention (no domain-steps/, steps-c/, technical-steps/)
find src/ -type d \( -name "domain-steps" -o -name "steps-c" -o -name "technical-steps" \) 2>/dev/null
```

**HALT if:**
- Package name changed from `@florian-trehaut/bmad-global`
- Any shared rule file is missing
- Non-standard step directories exist (upstream convention leaked through)

### 3. Check for Unintended Deletions

```bash
git diff --name-only --diff-filter=D HEAD~1..HEAD
```

For each deleted file:
- Was it a fork-only file? → **HALT** — this should not have been deleted
- Was it deleted by upstream intentionally? → Acceptable if not a fork-only file
- Flag any unexpected deletions for user review

### 4. Check for Conflict Markers

```bash
grep -rn "<<<<<<< " src/ .claude/ tools/ docs/ 2>/dev/null || echo "No conflict markers found"
```

**HALT if** any conflict markers remain.

### 5. Run Quality Gate

```bash
npm run quality
```

Report full results. If it fails:
- Identify whether the failure is from upstream content or from merge resolution
- Fix merge-introduced issues
- Do NOT dismiss failures as "pre-existing" without verification

### 6. Spot-Check Enhanced Files

For files that had conflicts and contain our enhancements, verify the enhancements are intact:

```bash
# ADR HALT checks still present in workflow steps
grep -l "ADR" src/bmm-skills/*/steps/*.md | head -5

# Worktree lifecycle references
grep -rl "worktree-lifecycle" src/ | head -5

# Shared rule loading in workflows
grep -rl "bmad-shared" src/bmm-skills/*/workflow.md | head -5
```

### 7. CHECKPOINT — Present Verification Report

```
## Merge Verification

### Merge commit: {hash}
### Upstream commits integrated: {N}
### Conflicts resolved: {M}
### Files adapted to fork conventions: {K}

### Fork Identity
- Package name: {OK/FAIL}
- Shared rules: {OK/FAIL}
- Step directory convention: {OK/FAIL}
- Workflow-context: {OK/FAIL}
- Fork-only files: {OK/FAIL}

### Quality Gate
- npm run quality: {PASS/FAIL}
- Conflict markers: {CLEAN/FOUND}

### Deleted files: {list or "none"}

### Enhancement preservation
- ADR checks: {present in N files}
- Worktree lifecycle: {referenced in N files}
- Shared rules: {loaded by N workflows}

### Conflict Resolution Log
{For each resolved conflict: file, strategy, what was kept/integrated/dropped}
```

WAIT for user confirmation.

If user identifies issues → fix them before proceeding.

---

**Next:** Read fully and follow `./step-05-complete.md`
