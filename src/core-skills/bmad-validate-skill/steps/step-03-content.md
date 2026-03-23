# Step 3: Content Quality Validation

## STEP GOAL

Validate the content quality of each file: size limits, required sections, checkpoint presence, variable usage, and hardcoded reference detection.

## RULES

- Every check produces a severity: PASS, WARN, or FAIL
- Record ALL findings in `FINDINGS[]` with category `CONTENT` or `REFERENCE`
- Do not stop at the first failure — run all checks

## SEQUENCE

### 1. Step file size

For each step file:

**Check 3.1 — Line count:**
- < 200 lines: PASS
- 200-249 lines: WARN ("Approaching limit")
- 250-299 lines: WARN ("Over soft limit, consider splitting")
- >= 300 lines: FAIL ("Must be split into smaller steps")

### 2. Workflow.md required sections

**Check 3.2 — INITIALIZATION section:**
- workflow.md must have an `## INITIALIZATION` section
- Severity: FAIL if missing

**Check 3.3 — CRITICAL RULES section:**
- workflow.md should have a `## CRITICAL RULES` section
- Severity: WARN if missing

**Check 3.4 — YOUR ROLE section:**
- workflow.md should have a `## YOUR ROLE` section
- Severity: WARN if missing

**Check 3.5 — Step-file architecture boilerplate:**
- workflow.md should reference "BMAD v6.2.0" or contain the step-file architecture header
- Severity: WARN if missing (may be outdated version)

### 3. Step file required sections

For each step file:

**Check 3.6 — STEP GOAL section:**
- Must have a `## STEP GOAL` section (or `## GOAL`)
- Severity: WARN if missing

**Check 3.7 — SEQUENCE / INSTRUCTIONS section:**
- Must have a `## SEQUENCE` section (or `## INSTRUCTIONS` or equivalent)
- Severity: WARN if missing

**Check 3.8 — CHECKPOINT presence:**
- Interactive steps (marked as "Interactive" in workflow.md step table) must have a CHECKPOINT section
- CHECKPOINT must contain "WAIT" or equivalent user-interaction directive
- Severity: WARN if interactive step lacks CHECKPOINT

### 4. Project-dependent skill checks

Determine if this skill is project-dependent (not a meta-skill):

**Check 3.9 — workflow-context.md loading:**
- If the skill is project-dependent, INITIALIZATION must load `.claude/workflow-context.md`
- Meta-skills (bmad-create-skill, bmad-edit-skill, bmad-validate-skill) are exempt
- Severity: WARN if project-dependent but does not load context

**Check 3.10 — Variable placeholders:**
- If project-dependent, references to project-specific values should use `{VARIABLE_NAME}` pattern
- Scan all files for bare references that should be variables
- Severity: WARN if found

### 5. Hardcoded reference detection

Scan ALL files in the skill for:

**Check 3.11 — Hardcoded project names:**
- Grep for specific project names, company names, product names
- Exclude documentation references and examples
- Severity: WARN if found
- Category: REFERENCE

**Check 3.12 — Hardcoded UUIDs:**
- Grep for UUID patterns (`[0-9a-f]{8}-[0-9a-f]{4}-...`)
- Severity: WARN if found
- Category: REFERENCE

**Check 3.13 — Hardcoded URLs:**
- Grep for `https://` or `http://` patterns
- Exclude documentation links (github.com, conventionalcommits.org, etc.)
- Severity: WARN if non-documentation URLs found
- Category: REFERENCE

**Check 3.14 — Legacy path references:**
- Grep for `{project-root}/_bmad/` or `_bmad/` references
- Severity: FAIL if found
- Category: REFERENCE

### 6. Path correctness

**PATH-01 — Relative path correctness:**
- In step files: verify references to data files use `../data/` not `./data/`
- In step files: verify references to sibling steps use `./step-` not `../steps/step-`
- In workflow.md: verify references to steps use `./steps/step-`
- Severity: FAIL if wrong

**PATH-02 — No `installed_path`:**
- Grep all files for `{installed_path}` — legacy BMAD pattern
- Severity: FAIL if found

**PATH-05 — No cross-skill file paths:**
- Grep for references to other skills' directories (patterns like `~/.claude/skills/bmad-OTHER-SKILL/`)
- Exception: references to `bmad-shared` are allowed
- Severity: WARN if found

### 7. Variable and invocation references

**REF-01 — Variable references defined:**
- Grep for `{VARIABLE_NAME}` patterns (uppercase with underscores in braces)
- For each variable found, check if it is mentioned in workflow.md INITIALIZATION section
- Severity: WARN for any variable used but not defined in initialization

**REF-03 — Skill invocation language:**
- Grep for other skill names preceded by "read and follow" or "load and follow" — these should use "Invoke the `skill-name` skill" instead
- Severity: WARN if found

### 8. Record findings

Add all findings to `FINDINGS[]` with appropriate categories (`CONTENT`, `REFERENCE`, or `PATH`).

Compute `SCORES.content`:
- PASS if all checks pass
- WARN if any WARN but no FAIL
- FAIL if any FAIL

### 9. Proceed

Load and execute `./steps/step-04-conventions.md`.
