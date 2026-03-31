# Step 6: Validate the Skill

## STEP GOAL

Run a comprehensive validation of the produced skill against all conventions. Find and fix issues before declaring the skill complete.

## RULES

- Load `../data/skill-conventions.md` as the validation reference
- Every check produces a PASS or FAIL verdict with evidence
- Fix FAIL items inline — do not defer
- Re-validate after fixes

## SEQUENCE

### 1. Structure validation

Verify all expected files exist and are non-empty:

```bash
# List all files
find {TARGET_DIR} -type f -name '*.md' | sort

# Check each file is non-empty
for file in $(find {TARGET_DIR} -type f -name '*.md'); do
  lines=$(wc -l < "$file")
  echo "$lines lines: $file"
done
```

**PASS** if all files from the design exist and have content.
**FAIL** if any file is missing or empty — create/populate it.

### 2. SKILL.md validation

Read `{TARGET_DIR}/SKILL.md` and verify:

| Check | Rule | Verdict |
|-------|------|---------|
| Has YAML frontmatter | Starts with `---` and ends with `---` | PASS/FAIL |
| Has `name` key | YAML contains `name:` | PASS/FAIL |
| Has `description` key | YAML contains `description:` | PASS/FAIL |
| Name format | `bmad-{lowercase-hyphenated}` | PASS/FAIL |
| Description has trigger phrases | Contains at least 3 trigger phrases | PASS/FAIL |
| Body content | Body is exactly `Follow the instructions in ./workflow.md.` | PASS/FAIL |
| No extra content | Nothing after the body line | PASS/FAIL |

### 3. workflow.md validation

Read `{TARGET_DIR}/workflow.md` and verify:

| Check | Rule | Verdict |
|-------|------|---------|
| Has INITIALIZATION section | `## INITIALIZATION` heading exists | PASS/FAIL |
| Has YOUR ROLE section | `## YOUR ROLE` heading exists | PASS/FAIL |
| Has CRITICAL RULES section | `## CRITICAL RULES` heading exists | PASS/FAIL |
| Has STEP SEQUENCE section | `## STEP SEQUENCE` heading exists | PASS/FAIL |
| Has ENTRY POINT section | `## ENTRY POINT` heading exists | PASS/FAIL |
| Context loading | If project-dependent: loads `{MAIN_PROJECT_ROOT}/.claude/workflow-context.md` with HALT | PASS/FAIL/N/A |
| Step sequence matches files | Every step in the table has a corresponding file in `steps/` | PASS/FAIL |
| Entry point valid | References an existing step file | PASS/FAIL |
| No hardcoded project refs | No project names, URLs, IDs | PASS/FAIL |

### 4. Step file validation

For EACH step file in `{TARGET_DIR}/steps/`:

| Check | Rule | Verdict |
|-------|------|---------|
| Line count | < 250 lines | PASS/FAIL |
| Has step header | `# Step {N}: {Name}` | PASS/FAIL |
| Has STEP GOAL | Section describing the goal | PASS/FAIL |
| Has SEQUENCE | Numbered instructions | PASS/FAIL |
| Has NEXT pointer | Ends with `**Next:**` or `## END OF WORKFLOW` | PASS/FAIL |
| NEXT points to existing file | Referenced file exists in `steps/` | PASS/FAIL |
| No orphan steps | Step is referenced by workflow.md or another step | PASS/FAIL |
| No hardcoded project refs | No project names, URLs, tool names | PASS/FAIL |

### 5. Cross-reference validation

Verify the step chain is complete and unbroken:

1. Start from the ENTRY POINT in workflow.md
2. Follow each NEXT pointer
3. Verify the chain reaches END OF WORKFLOW without:
   - Dead ends (NEXT points to non-existent file)
   - Orphans (step file exists but is not in the chain)
   - Loops (step points back to an earlier step without explicit loop logic)

### 6. Convention compliance

Check against `./data/skill-conventions.md`:

| Convention | Check | Verdict |
|------------|-------|---------|
| No workflow.yaml | File does not exist | PASS/FAIL |
| No instructions.xml | File does not exist | PASS/FAIL |
| No `_bmad/` references | Grep for `_bmad/` | PASS/FAIL |
| No hardcoded tool names | Grep for `pnpm`, `glab`, `gh` (outside templates) | PASS/FAIL |
| Variables use `{NAME}` format | Grep for common variable patterns | PASS/FAIL |
| Data files referenced correctly | All `./data/*.md` refs point to existing files | PASS/FAIL |

### 7. Compile validation report

```
## Validation Report: bmad-{SKILL_NAME}

### Results
| Category | Checks | Passed | Failed |
|----------|--------|--------|--------|
| Structure | {n} | {p} | {f} |
| SKILL.md | {n} | {p} | {f} |
| workflow.md | {n} | {p} | {f} |
| Step files | {n} | {p} | {f} |
| Cross-references | {n} | {p} | {f} |
| Conventions | {n} | {p} | {f} |
| **Total** | **{N}** | **{P}** | **{F}** |

### Failed Checks
{list of failed checks with evidence — or "None"}

### Fixes Applied
{list of fixes applied — or "None needed"}
```

### 8. Fix and re-validate

If any checks failed:
1. Fix each issue
2. Re-run ONLY the failed checks
3. Update the report

Continue until all checks pass.

---

**Next:** Read fully and follow `./steps/step-07-complete.md`
