# Step 3: Verify Merge Result

## STEP GOAL

Verify that the merge result is correct — no broken files, no lost content, quality checks pass.

## RULES

- Do NOT skip verification even if the merge was clean
- Any verification failure must be reported and fixed before proceeding

## SEQUENCE

### 1. Verify Merge State

```bash
git status
git log --oneline -3
```

Confirm: merge commit exists, working tree clean.

### 2. Check for Unintended Deletions

Compare files that existed before merge in both branches:

```bash
# Files that existed in our branch before merge but are now gone
git diff --name-only --diff-filter=D HEAD~1..HEAD
```

If any files were deleted by the merge that we had in our branch → flag for review. These could be legitimate upstream deletions or accidental conflict resolution errors.

### 3. Run Quality Gate

If available in the project, run the quality checks:

```bash
# Check markdownlint on src/ skills
npx markdownlint-cli2 "src/**/*.md" 2>&1 || true

# Check file reference validator if available
node tools/validate-file-refs.js 2>&1 || true

# Check skill validator if available
node tools/validate-skills.js 2>&1 || true
```

Report results. Failures related to pre-existing issues (upstream) vs. introduced by the merge must be distinguished.

### 4. Spot-Check Conflict Resolutions

For each file that had a conflict in step 2:

```bash
git show HEAD -- {file} | head -30
```

Quick verification: no conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) left in any file.

```bash
grep -rn "<<<<<<< " src/ .claude/ 2>/dev/null || echo "No conflict markers found"
```

### 5. CHECKPOINT — Present Verification Report

```
## Merge Verification

### Merge commit: {hash}
### Upstream commits integrated: {N}
### Conflicts resolved: {M}

### Quality checks
- markdownlint: {PASS/FAIL/N/A}
- file-refs: {PASS/FAIL/N/A}
- skill-validator: {PASS/FAIL/N/A}
- conflict markers: {CLEAN}

### Deleted files: {list or "none"}

### Conflict resolution log
{For each resolved conflict: file, strategy, what was done}
```

WAIT for user confirmation.

If user identifies issues → fix them and amend the merge commit.

---

**Next:** Read fully and follow `./step-04-complete.md`
