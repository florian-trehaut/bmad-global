# Step 2: Execute Merge

## STEP GOAL

Execute the git merge from upstream/main into our branch. Resolve conflicts using our fork's conventions as the structural authority while integrating upstream's content additions.

## RULES

- Our file structure and organization is authoritative
- Upstream content additions (new features, bugfixes) are integrated into our structure
- When a file was restructured by us and modified by them: keep our structure, integrate their content changes
- When a file was deleted/moved by us but modified by them: apply their content change to the file at its new location in our tree
- NEVER silently drop upstream changes — every conflict resolution must be explained

## SEQUENCE

### 1. Execute Merge

```bash
git merge {UPSTREAM_REMOTE}/main --no-edit
```

### 2. Handle Merge Result

**If clean merge (no conflicts):**
- Log: "Clean merge — no conflicts."
- Proceed to step 3.

**If conflicts:**
- List all conflicted files:

```bash
git diff --name-only --diff-filter=U
```

### 3. Resolve Each Conflict

For EACH conflicted file:

#### 3a. Analyze the Conflict

```bash
# Show the conflict markers
git diff {file}

# Show what upstream changed
git diff {MERGE_BASE}..{UPSTREAM_REMOTE}/main -- {file}

# Show what we changed
git diff {MERGE_BASE}..HEAD -- {file}
```

#### 3b. Determine Resolution Strategy

| Situation | Strategy |
|-----------|----------|
| We restructured, they added content | Keep our structure, integrate their additions |
| We restructured, they fixed a bug | Apply their bugfix to our version of the file |
| We deleted/moved, they modified | Apply their changes to the file at its new location |
| We added content, they added content | Merge both additions |
| Both modified same lines | Present to user for decision |
| They restructured, we restructured | Our structure wins — integrate any new content from theirs |

#### 3c. Apply Resolution

For each conflict:

1. Read both versions carefully
2. Apply the resolution strategy
3. Edit the file to resolve
4. Log the resolution: "Resolved {file}: {strategy applied}. {what was kept/integrated/dropped}"

```bash
git add {file}
```

#### 3d. Escalate if Ambiguous

If a conflict cannot be resolved by the strategies above:

- Present both versions to the user
- Explain what each side did and why they conflict
- Ask the user which approach to take
- WAIT for user decision

### 4. Verify No Remaining Conflicts

```bash
git diff --name-only --diff-filter=U
```

If any remain → loop back to step 3 for remaining files.

### 5. Complete the Merge Commit

```bash
git commit --no-edit
```

Log: "Merge commit created. {N} conflicts resolved."

---

**Next:** Read fully and follow `./step-03-verify.md`
