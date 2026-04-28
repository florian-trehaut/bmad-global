# Step 5: Validation Report


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Validation Report with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Compile all findings into a structured validation report with an overall verdict.

## SEQUENCE

### 1. Compute totals

Count findings by severity:
- `PASS_COUNT` = number of PASS findings
- `WARN_COUNT` = number of WARN findings
- `FAIL_COUNT` = number of FAIL findings
- `TOTAL_CHECKS` = PASS_COUNT + WARN_COUNT + FAIL_COUNT

### 2. Determine overall verdict

- **VALID** — all checks PASS (WARN_COUNT = 0 AND FAIL_COUNT = 0)
- **NEEDS_WORK** — some warnings but no failures (WARN_COUNT > 0 AND FAIL_COUNT = 0)
- **INVALID** — at least one failure (FAIL_COUNT > 0)

### 3. Present the report

```
======================================
  SKILL VALIDATION — {VALID|NEEDS_WORK|INVALID}
  Skill: {TARGET_SKILL.name}
  Location: {TARGET_SKILL.base_path}
======================================

## Summary

| Category   | PASS | WARN | FAIL |
|------------|------|------|------|
| SKILL      | X    | Y    | Z    |
| WORKFLOW   | X    | Y    | Z    |
| PATH       | X    | Y    | Z    |
| STEP       | X    | Y    | Z    |
| SEQUENCE   | X    | Y    | Z    |
| REFERENCE  | X    | Y    | Z    |
| OUR RULES  | X    | Y    | Z    |
| **Total**  | X    | Y    | Z    |

## Findings
```

### 4. List findings by severity, grouped by category with stable rule IDs

Rule ID categories:
- **SKILL**: SKILL-01 through SKILL-07 (SKILL.md existence, frontmatter, description quality, etc.)
- **WORKFLOW**: WF-01, WF-02, WF-03 (workflow.md frontmatter hygiene, path variables)
- **PATH**: PATH-01, PATH-02, PATH-05 (relative paths, `installed_path`, cross-skill paths)
- **STEP**: STEP-01 through STEP-07 (step numbering, sections, halt-before-menu, forward loading, frontmatter, step count)
- **SEQUENCE**: SEQ-01, SEQ-02 (no skip instructions, no time estimates)
- **REFERENCE**: REF-01, REF-03 (variable definitions, skill invocation language)
- **OUR RULES**: OUR-01 (NEXT chain walk), OUR-02 (orphan detection), OUR-03 (CHECKPOINT presence)

Each finding uses this format:

```
- **{RULE-ID}** [{SEVERITY}] `{file_path}`
  {description}
  Fix: {specific fix instruction}
```

**FAIL findings first** (highest priority):

```
### FAIL

- **PATH-01** [FAIL] `steps/step-03-apply.md`
  References data file with `./data/checklist.md` instead of `../data/checklist.md`
  Fix: Change `./data/` to `../data/` — step files are in steps/, data is a sibling directory

- **SEQ-01** [FAIL] `steps/step-02-load.md:18`
  Contains "skip to step 5 if no issues found" — steps must execute in sequence
  Fix: Remove skip instruction; use conditional logic within the step instead
```

**WARN findings next:**

```
### WARN

- **SKILL-06** [WARN] `SKILL.md`
  Description lacks trigger phrases — no "Use when" or quoted trigger words found
  Fix: Add trigger phrases to description (e.g., 'Use when "validate skill" is mentioned')

- **REF-01** [WARN] `steps/step-02-load.md:34`
  Variable `{PROJECT_NAME}` used but not defined in workflow.md INITIALIZATION section
  Fix: Add `{PROJECT_NAME}` to the INITIALIZATION section of workflow.md
```

**PASS findings (collapsed):**

```
### PASS

All other checks passed ({PASS_COUNT}/{TOTAL_CHECKS}).
```

### 5. Suggest next steps

**If INVALID or NEEDS_WORK:**

"Run `/bmad-edit-skill` to fix the issues found. The FAIL items should be addressed first."

**If VALID:**

"Skill **{TARGET_SKILL.name}** passes all validation checks."

End of workflow.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Validation Report
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-validate-skill executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '02', '03', '04', '05'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
