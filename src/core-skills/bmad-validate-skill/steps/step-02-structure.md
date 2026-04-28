# Step 2: Structure Validation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Structure Validation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Verify the structural integrity of the skill: required files exist, step numbering is correct, NEXT pointers form a valid chain, and the workflow.md step table matches reality.

## RULES

- Every check produces a severity: PASS, WARN, or FAIL
- Record ALL findings in `FINDINGS[]` with category `STRUCTURE`
- Do not stop at the first failure — run all checks

## SEQUENCE

### 1. Required files

**Check 1.1 — SKILL.md exists:**
- File `SKILL.md` must exist at the skill root
- Severity: FAIL if missing

**Check 1.2 — SKILL.md frontmatter:**
- Must have YAML frontmatter with `name` and `description` fields
- `name` must match the directory name (e.g., `bmad-dev-story` for `~/.claude/skills/bmad-dev-story/`)
- `description` must be a non-empty string
- Severity: FAIL if frontmatter missing, WARN if name mismatch

**Check 1.3 — workflow.md exists:**
- File `workflow.md` must exist at the skill root
- Severity: FAIL if missing

**Check 1.4 — Step files exist:**
- At least 1 step file must exist (in `steps/` or at the skill root)
- Step files match pattern `step-XX-*.md`
- Severity: FAIL if no step files found

### 2. Step numbering

**Check 2.1 — Sequential numbering:**
- Extract step numbers from all step file names
- Numbers must be sequential starting from 01 (no gaps: 01, 02, 03...)
- Severity: WARN if gaps exist

**Check 2.2 — Heading consistency:**
- Each step file heading (`# Step N: ...`) must match its file number
- Severity: WARN if mismatch

### 3. NEXT pointer chain

**Check 3.1 — Chain integrity:**
- Start from the ENTRY POINT referenced in workflow.md
- Walk each step file, finding the "Proceed" section or equivalent NEXT pointer
- Each NEXT pointer must reference an existing file
- The chain must reach every step file (no orphans)
- The last step must have no forward pointer (or says "End of workflow")
- Severity: FAIL if chain is broken, WARN if orphan steps exist

**Check 3.2 — ENTRY POINT validity:**
- workflow.md ENTRY POINT must reference an existing step file
- Severity: FAIL if target does not exist

### 4. Workflow.md step table

**Check 4.1 — Step table exists:**
- workflow.md must have a STEP SEQUENCE table
- Severity: FAIL if missing

**Check 4.2 — Table matches files:**
- Every row in the step table must correspond to an existing step file
- Every step file must appear in the table
- Severity: WARN if mismatch

### 5. Orphan files

**Check 5.1 — No orphan data files:**
- Every file in `data/` must be referenced by at least one step file or workflow.md
- Severity: WARN if orphan data files found

**Check 5.2 — No orphan subagent files:**
- Every file in `subagent-workflows/` must be referenced by at least one step file or workflow.md
- Severity: WARN if orphan subagent files found

### 6. SKILL.md description quality

**SKILL-06 — Description constraints:**
- `description` in SKILL.md must be <= 1024 characters
- `description` must contain trigger phrases — look for "Use when" or quoted trigger words (e.g., `'create skill'`, `'validate workflow'`)
- Severity: FAIL if > 1024 chars, WARN if missing trigger phrases

### 7. Step count limits

**STEP-07 — Step count:**
- Count step files in `steps/` directory
- 0 step files: FAIL ("no step files found")
- 1 step file: WARN ("single step — consider if this needs to be a skill or just a CLAUDE.md instruction")
- 2-10 step files: PASS
- > 10 step files: FAIL ("too many steps, risk of LLM context degradation")

### 8. Record findings

Add all findings to `FINDINGS[]`:

```
{
  category: 'STRUCTURE',
  check_id: '1.1',
  severity: 'PASS|WARN|FAIL',
  description: '...',
  file: '...',
  suggested_fix: '...'
}
```

Compute `SCORES.structure`:
- PASS if all checks pass
- WARN if any WARN but no FAIL
- FAIL if any FAIL

### 9. Proceed

Load and execute `./steps/step-03-content.md`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Structure Validation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
