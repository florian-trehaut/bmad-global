# Step 3: Review Imported Changes

## STEP GOAL

Systematically audit every file changed by the merge to ensure our fork conventions are respected. This step catches what conflict resolution misses: files that merged cleanly but violate our structure, and upstream additions that need adaptation.

## RULES

- Audit ALL files changed by the merge, not just conflicted ones
- Apply fork-identity.md rules to every imported change
- Fix violations immediately — do not defer to a future step
- Present a structured report of all findings and fixes before proceeding

## SEQUENCE

### 1. Identify All Files Changed by Merge

```bash
# Files introduced or modified by the merge commit
git diff --name-only HEAD~1..HEAD
```

Store this list. Every file in it must be audited.

### 2. Structural Convention Audit

#### 2a. Step Directory Naming

Non-standard step directories MUST be renamed to `steps/`:

```bash
find src/ -type d \( -name "domain-steps" -o -name "technical-steps" -o -name "steps-c" -o -name "steps-e" -o -name "steps-v" \) 2>/dev/null
```

For each found:
```bash
git mv {skill_path}/{non_standard_dir}/ {skill_path}/steps/
```

Also check for root-level step files (outside any directory):
```bash
find src/ -maxdepth 4 -name "step-*.md" -not -path "*/steps/*" 2>/dev/null
```

#### 2b. Step File Naming

All step files must follow `step-{NN}-{slug}.md` format:

```bash
find src/ -path "*/steps/step-*" -name "*.md" | grep -v -E "step-[0-9]{2}[b-z]?-" 2>/dev/null
```

Flag any that use upstream patterns like `step-v-01-`, `step-c-01-`, or unnumbered names.

#### 2c. Skill Naming

All skill directories must start with `bmad-`:

```bash
ls -d src/*/[!b]* src/*/*/[!b]* 2>/dev/null | grep -v node_modules | grep -v module
```

### 3. Workflow Architecture Audit

#### 3a. Monolithic Workflow Detection

Check for workflows that upstream merged as monolithic (>300 lines) where we might want step decomposition:

```bash
for f in $(git diff --name-only HEAD~1..HEAD | grep "workflow.md"); do
  lines=$(wc -l < "$f")
  if [ "$lines" -gt 300 ]; then
    echo "MONOLITHIC: $f ($lines lines)"
  fi
done
```

For each monolithic workflow found:
- Present to user: "Upstream merged {file} as {N}-line monolithic workflow. Decompose into steps? [Y/N]"
- If Y: flag for manual decomposition (out of scope for this step — create a follow-up task)
- If N: accept as-is

#### 3b. Shared Rules Loading

Every workflow.md in `src/` that has an INITIALIZATION section must load our shared rules:

```bash
for f in $(git diff --name-only HEAD~1..HEAD | grep "workflow.md"); do
  if ! grep -q "bmad-shared" "$f" 2>/dev/null; then
    echo "MISSING SHARED RULES: $f"
  fi
done
```

For each missing: check if the workflow has an INITIALIZATION section. If yes, add the shared rules loading block:

```markdown
### N. Load shared rules

Glob `~/.claude/skills/bmad-shared/*.md`, then Read each file individually.
Apply these rules for the entire workflow execution.
```

#### 3c. Project Root Resolution

Workflows that read `.claude/` files must resolve `{MAIN_PROJECT_ROOT}`:

```bash
for f in $(git diff --name-only HEAD~1..HEAD | grep -E "workflow.md|step-.*\.md"); do
  if grep -q "\.claude/" "$f" 2>/dev/null; then
    if ! grep -q "MAIN_PROJECT_ROOT\|git-common-dir\|project-root-resolution" "$f" 2>/dev/null; then
      echo "MISSING ROOT RESOLUTION: $f"
    fi
  fi
done
```

### 4. Content Quality Audit

#### 4a. Config Loading Pattern

Upstream used `_bmad/bmm/config.yaml` for configuration. We use `workflow-context.md`. Check for stale upstream patterns:

```bash
git diff --name-only HEAD~1..HEAD | xargs grep -l "_bmad/bmm/config.yaml\|_bmad/config" 2>/dev/null
```

For each found: replace with our `workflow-context.md` loading pattern.

#### 4b. Hardcoded Paths

Check for upstream's path patterns that don't match our structure:

```bash
git diff --name-only HEAD~1..HEAD | xargs grep -l "tools/installer/\|tools/cli/installers/" 2>/dev/null | grep -v "^tools/"
```

Flag any non-tools files that reference installer paths.

#### 4c. ADR Awareness

New or modified workflow steps in implementation phase should have ADR detection. Check files modified by the merge in `4-implementation/`:

```bash
git diff --name-only HEAD~1..HEAD | grep "4-implementation.*step-" | while read f; do
  if ! grep -qi "ADR\|architecture.decision" "$f" 2>/dev/null; then
    echo "NO ADR CHECK: $f (implementation step without ADR awareness)"
  fi
done
```

Present findings — not all steps need ADR checks, but flag for review.

#### 4d. Worktree Lifecycle

New or modified steps that create worktrees must reference the shared rule:

```bash
git diff --name-only HEAD~1..HEAD | xargs grep -l "git worktree add\|worktree_add" 2>/dev/null | while read f; do
  if ! grep -q "worktree-lifecycle" "$f" 2>/dev/null; then
    echo "MISSING WORKTREE LIFECYCLE: $f"
  fi
done
```

### 5. New Skills Audit

For each new skill introduced by the merge:

```bash
git diff --name-only HEAD~1..HEAD | grep "SKILL.md" | while read f; do
  dir=$(dirname "$f")
  echo "=== $dir ==="
  echo "  Has workflow.md: $([ -f "$dir/workflow.md" ] && echo YES || echo NO)"
  echo "  Has steps/: $([ -d "$dir/steps" ] && echo YES || echo NO)"
  echo "  Step count: $(ls "$dir/steps/" 2>/dev/null | wc -l)"
  echo "  Has data/: $([ -d "$dir/data" ] && echo YES || echo NO)"
  echo "  Has templates/: $([ -d "$dir/templates" ] && echo YES || echo NO)"
done
```

For each new skill, verify:
- SKILL.md has valid frontmatter (name, description)
- Skill directory name matches frontmatter name
- Step files follow our naming convention
- No non-standard directories

### 6. Apply Fixes

For all violations found in sections 2-5:
- Apply structural fixes (renames, moves) with `git mv`
- Apply content fixes (shared rules, root resolution) with file edits
- Log each fix: `Fixed {file}: {what was done}`

Stage all changes:
```bash
git add -A
```

If any fixes were applied, amend the merge commit:
```bash
git commit --amend --no-edit
```

### 7. CHECKPOINT — Present Review Report

```
## Import Review Report

### Files audited: {N}

### Structural Fixes
| Fix | File | Action |
|-----|------|--------|
| {type} | {path} | {what was done} |

### Convention Violations Found & Fixed: {N}
### Convention Violations Deferred: {N} (with justification)

### New Skills Imported
| Skill | Structure | Status |
|-------|-----------|--------|
| {name} | {workflow + N steps} | {OK / adapted} |

### Monolithic Workflows (user decision pending)
{list or "None"}

### Missing Shared Rules (added)
{list or "None"}

### Stale Upstream Patterns (fixed)
{list or "None"}
```

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-04-verify.md`
