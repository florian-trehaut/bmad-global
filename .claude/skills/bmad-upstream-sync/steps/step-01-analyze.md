# Step 1: Analyze Upstream Divergence

## STEP GOAL

Fetch upstream, analyze EACH commit individually, classify by impact type, predict conflicts against our fork identity, and present a structured sync plan.

## RULES

- Do NOT modify any files in this step — read-only analysis
- Analyze each upstream commit individually, not as a bulk diff
- Classify every commit's impact on our fork using fork-identity.md rules
- Present ALL commits — no filtering or skipping

## SEQUENCE

### 1. Fetch Upstream

```bash
git fetch {UPSTREAM_REMOTE}
```

### 2. Find Last Sync Point

```bash
git merge-base {CURRENT_BRANCH} {UPSTREAM_REMOTE}/main
```

Store as `{MERGE_BASE}`.

### 3. List All Upstream Commits

```bash
git log --oneline --reverse {MERGE_BASE}..{UPSTREAM_REMOTE}/main
```

Store the ordered list. These commits will be analyzed individually.

### 4. Analyze Each Upstream Commit

For EACH commit in the list (oldest to newest):

```bash
# What this commit changed
git show --stat {hash}

# Full diff for understanding intent
git show {hash}
```

Classify each commit into one of these categories:

| Category | Description | Fork action |
|----------|-------------|-------------|
| **CLEAN_ADOPT** | New files or changes to files we haven't modified | Accept as-is |
| **INTEGRATE** | Changes to files we also modified — content is valuable | Merge content into our version |
| **RESTRUCTURE** | New skill or feature using upstream conventions we don't follow | Adopt content, adapt to our structure (step dirs, shared rules) |
| **FORK_PROTECTED** | Changes to package.json name, README, CHANGELOG, or fork-only files | Keep ours, ignore theirs |
| **EVALUATE** | Refactoring or architectural change — needs user decision | Present both approaches to user |

### 5. Identify Conflict Zones

```bash
# Files modified by both sides since merge base
git diff --name-only {MERGE_BASE}..{CURRENT_BRANCH} > /tmp/ours.txt
git diff --name-only {MERGE_BASE}..{UPSTREAM_REMOTE}/main > /tmp/theirs.txt
comm -12 <(sort /tmp/ours.txt) <(sort /tmp/theirs.txt)
```

For each file modified by both sides:
- What we changed (enhancement? restructuring? bugfix?)
- What they changed (new content? bugfix? refactor?)
- Check against fork-identity.md rules
- Predict: **CLEAN** (auto-merge likely), **MINOR** (small overlap), **MAJOR** (structural conflict), **PROTECTED** (fork-only file)

### 6. Check for New Upstream Skills

```bash
# Skills in upstream that we don't have
diff <(git ls-tree -d --name-only {UPSTREAM_REMOTE}/main src/ | sort) \
     <(git ls-tree -d --name-only {CURRENT_BRANCH} src/ | sort) \
     | grep "^< "
```

For each new skill:
- Does it use standard `steps/` directory or a non-standard name?
- Does it reference shared rules?
- What adaptation is needed for our conventions?

### 7. CHECKPOINT — Present Sync Plan

```
## Upstream Sync Analysis

### Sync point
- Last sync: {MERGE_BASE} ({date})
- Upstream commits to integrate: {N}
- Our commits since divergence: {M}

### Commit-by-Commit Plan

| # | Commit | Category | Impact | Action |
|---|--------|----------|--------|--------|
| 1 | {hash} {msg} | CLEAN_ADOPT | {files} | Accept as-is |
| 2 | {hash} {msg} | INTEGRATE | {files} | Merge content, keep our enhancements |
| 3 | {hash} {msg} | RESTRUCTURE | {files} | Adapt to our step-file conventions |
| ... | ... | ... | ... | ... |

### Conflict Prediction

| File | Our change | Their change | Severity | Resolution |
|------|-----------|-------------|----------|------------|
| ... | ... | ... | CLEAN/MINOR/MAJOR/PROTECTED | ... |

### New Skills from Upstream
{list of new skills with adaptation notes, or "None"}

### Fork-Protected Files (will keep ours)
{list of protected files that upstream also changed}

### Summary
- Clean adopts: {N} (no conflict expected)
- Content integrations: {N} (merge needed)
- Restructures: {N} (adapt to our conventions)
- Protected: {N} (keep ours)
- Evaluate: {N} (user decision needed)
```

WAIT for user confirmation before proceeding.

---

**Next:** Read fully and follow `./step-02-merge.md`
