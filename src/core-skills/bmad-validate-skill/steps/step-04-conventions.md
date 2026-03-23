# Step 4: Convention Compliance

## STEP GOAL

Verify that the skill follows all bmad-* convention patterns and does not use legacy or deprecated patterns.

## RULES

- Every check produces a severity: PASS, WARN, or FAIL
- Record ALL findings in `FINDINGS[]` with category `CONVENTION`
- If `skill-conventions.md` was loaded, use it as the authoritative source
- If not loaded, use the conventions inferred from reading existing skills

## SEQUENCE

### 1. SKILL.md body

**Check 4.1 — Body content:**
- SKILL.md body (after frontmatter) should be exactly: `Follow the instructions in ./workflow.md.`
- Minor variants are acceptable ("Follow the instructions in ./workflow.md" without period)
- Severity: WARN if body contains additional content beyond this line

### 2. Legacy pattern detection

**Check 4.2 — No workflow.yaml:**
- Skill must NOT contain a `workflow.yaml` file
- Severity: FAIL if found

**Check 4.3 — No instructions.xml:**
- Skill must NOT contain an `instructions.xml` file
- Severity: FAIL if found

**Check 4.4 — No workflow.xml references:**
- No file should reference `workflow.xml` or "workflow engine"
- Severity: FAIL if found

**Check 4.5 — No legacy _bmad paths:**
- No file should reference `{project-root}/_bmad/` or `_bmad/bmm/` or `_bmad/core/`
- Severity: FAIL if found

**Check 4.6 — No disable-model-invocation:**
- No file should contain `disable-model-invocation` pattern
- Severity: FAIL if found

### 3. File naming conventions

**Check 4.7 — Step file naming:**
- Step files must follow `step-XX-name.md` format
- XX must be zero-padded two digits (01, 02, ... 99)
- name must be lowercase with hyphens (no underscores, no camelCase)
- Severity: WARN if naming does not follow convention

**Check 4.8 — Data file naming:**
- Data files in `data/` must be `.md` files with lowercase hyphenated names
- Severity: WARN if naming does not follow convention

### 4. Content conventions

**Check 4.9 — Step file "Proceed" pattern:**
- Non-terminal step files should end with a "Proceed" section that loads the next step
- Pattern: `Load and execute ./steps/step-XX-name.md.` or `Load and execute ./step-XX-name.md.`
- Severity: WARN if a non-terminal step does not follow this pattern

**Check 4.10 — Data files are meaningful:**
- Data files must not be empty (0 bytes)
- Data files should have at least a heading and some content (> 3 lines)
- Severity: WARN if empty or near-empty

**Check 4.11 — Subagent workflow self-containment:**
- If `subagent-workflows/` exists, each file should be self-contained
- Must include its own instructions, not just references to step files
- Severity: WARN if a subagent file appears to be just a pointer

### 5. Workflow frontmatter hygiene

**WF-01/WF-02 — No name/description in non-SKILL.md:**
- Scan all `.md` files except `SKILL.md` for `name:` or `description:` in YAML frontmatter
- Only SKILL.md should have `name:` and `description:` in frontmatter — other files must not
- Severity: WARN if found

**WF-03 — No path variables in frontmatter:**
- Check workflow.md YAML frontmatter for path-like values (strings containing `/` or `./`)
- Frontmatter should contain metadata, not file paths
- Severity: WARN if found

### 6. Step interaction and sequencing

**STEP-04 — Halt before menu:**
- Find sections with menu keywords: `[C]`, `[Y/N]`, `Choose:`, `Options:`, `Select:`
- Check that nearby text (within 5 lines before the menu) contains HALT/wait/checkpoint language (e.g., "HALT", "WAIT", "CHECKPOINT", "pause", "ask the user")
- Severity: WARN if menu without halt

**STEP-05 — No forward loading:**
- In each `step-N` file, check for references to `step-M` where M > N+1 (excluding the final "Proceed" / NEXT section)
- A step should only reference the immediately next step, not skip ahead
- Severity: WARN if found

**STEP-06 — No name/description in step frontmatter:**
- Check each step file for YAML frontmatter containing `name:` or `description:` keys
- Step files should not have their own name/description metadata
- Severity: WARN if found

### 7. Sequence integrity

**SEQ-01 — No skip instructions:**
- Grep all files for: "skip to", "jump to", "go directly to", "proceed to step N" where N > current+1
- Steps must be executed in order — no skip-ahead instructions
- Severity: FAIL if found

**SEQ-02 — No time estimates:**
- Grep all files for: `~N min`, "takes about", "approximately N minutes", "should take"
- LLMs do not have time awareness — time estimates are meaningless and misleading
- Severity: WARN if found

### 8. Retrospective integration

**Check: RETRO-01 — Retrospective Integration**

- Grep workflow.md for "WORKFLOW COMPLETION" or "RETROSPECTIVE" or "retrospective-step.md"
- If found: PASS
- If NOT found AND skill is not read-only analysis: WARN ("workflow.md missing RETROSPECTIVE section — the self-improvement loop won't trigger after execution")
- Read-only skills (description contains "validate", "check", "verify" without "execute", "implement", "create"): skip this check

### 9. Record findings

Add all findings to `FINDINGS[]` with category `CONVENTION`.

Compute `SCORES.conventions`:
- PASS if all checks pass
- WARN if any WARN but no FAIL
- FAIL if any FAIL

### 10. Proceed

Load and execute `./steps/step-05-report.md`.
