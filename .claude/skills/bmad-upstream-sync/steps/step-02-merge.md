# Step 2: Execute Merge

## STEP GOAL

Execute the git merge from upstream/main. Resolve conflicts using fork-identity.md rules: our structure is authoritative, upstream content additions are integrated.

## RULES

- Refer to `../references/fork-identity.md` for every conflict resolution decision
- Our file structure, naming, and organization is authoritative
- Upstream content additions (new features, bugfixes) are integrated into our structure
- Our enhancements (ADR checks, estimation, shared rules, worktree lifecycle) are preserved
- NEVER silently drop upstream changes — every resolution must be logged
- Fork-protected files are NEVER overwritten (package identity, CHANGELOG, README, .claude/)

## SEQUENCE

### 1. Execute Merge

```bash
git merge {UPSTREAM_REMOTE}/main --no-edit
```

### 2. Handle Merge Result

**If clean merge (no conflicts):**
- Log: "Clean merge — no conflicts."
- Proceed to section 4.

**If conflicts:**
- List all conflicted files:

```bash
git diff --name-only --diff-filter=U
```

### 3. Resolve Each Conflict

For EACH conflicted file, follow this process:

#### 3a. Check Fork-Identity Category

Consult `fork-identity.md`:
- Is this file fork-protected? → Keep ours entirely: `git checkout --ours {file} && git add {file}`
- Is this a file we enhanced? → Keep our enhancements, integrate their content additions
- Is this a file only they changed? → Should have auto-merged — investigate

#### 3b. Analyze the Conflict

```bash
# Show conflict markers
git diff {file}

# What upstream changed (intent)
git diff {MERGE_BASE}..{UPSTREAM_REMOTE}/main -- {file}

# What we changed (our enhancements)
git diff {MERGE_BASE}..HEAD -- {file}
```

#### 3c. Apply Resolution per Category

| Situation | Strategy |
|-----------|----------|
| **Fork-protected file** (package.json name, CHANGELOG, README) | Keep ours: `git checkout --ours {file}` |
| **We enhanced, they added content** | Keep our enhancements, integrate their new content |
| **We enhanced, they fixed a bug** | Apply their bugfix to our enhanced version |
| **We restructured (step dirs, naming), they modified** | Keep our structure, apply their content to our version |
| **They added new skill with non-standard dirs** | Accept content, rename dirs to our convention |
| **We added shared rule references, they didn't have them** | Keep our references |
| **Both modified same lines** | Present to user for decision |

#### 3d. Log Resolution

For each resolved file:
```
Resolved {file}: {strategy}
  - Kept: {what we preserved}
  - Integrated: {what we took from upstream}
  - Dropped: {what we didn't take, and why}
```

```bash
git add {file}
```

#### 3e. Escalate Ambiguous Conflicts

If a conflict cannot be resolved by fork-identity.md rules:
- Present both versions to the user
- Explain what each side did
- Reference which fork-identity rule applies (or none)
- WAIT for user decision

### 4. Post-Merge Adaptation

After all conflicts are resolved, check if any RESTRUCTURE items from step-01 need manual adaptation:

- New upstream skills with `domain-steps/`, `technical-steps/`, or `steps-c/` directories → rename to `steps/`
- New upstream workflows missing shared rule references → add references to our shared rules
- New upstream skills missing worktree lifecycle guard → add guard if the skill creates worktrees

### 5. Verify No Remaining Conflicts

```bash
git diff --name-only --diff-filter=U
```

If any remain → loop back to step 3.

### 6. Complete the Merge Commit

```bash
git commit --no-edit
```

Log: "Merge commit created. {N} conflicts resolved. {M} files adapted to fork conventions."

---

**Next:** Read fully and follow `./step-03-verify.md`
