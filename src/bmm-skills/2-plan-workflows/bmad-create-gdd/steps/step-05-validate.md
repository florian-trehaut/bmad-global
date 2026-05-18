---
nextStepFile: './step-06-finalize.md'
---

# Step 5: Validation Pass

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-04-EXIT emis dans la conversation)
- [ ] `gdd.md` and `epics.md` exist and contain all sections from step 03 + 04

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Validation Pass with {doc_workspace=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Run the GDD validator subagent against `gdd.md` and `epics.md` using `data/gdd-validation-checklist.md`. The subagent must read `data/game-types.csv` and `data/genre-complexity.csv` for the genre and game-type checks. Findings stay in-conversation — autofix obvious issues, ask on ambiguous ones.

## RULES

- Validator output stays in-conversation. **No report file is written by default.** (If the user explicitly requested a report, write to `{DOC_WORKSPACE}/gdd-validation-report.md` instead.)
- Resolve findings before proceeding to finalize.
- Autofix obvious issues (typos, missing assumption tags, table formatting). Ask the user on ambiguous ones (e.g., a missing pillar, conflicting mechanic, scope-creep concern).
- For Validate intent (user wants critique only), this step IS the workflow — skip to retrospective at the end of this step instead of step-06-finalize.

## SEQUENCE

### 1. Spawn the validator subagent

Spawn a subagent with:

- **Scope files**: `{DOC_WORKSPACE}/gdd.md`, `{DOC_WORKSPACE}/epics.md`, `data/gdd-validation-checklist.md`, `data/game-types.csv`, `data/genre-complexity.csv`, `data/game-types/{fragment_file}` (the matched genre guide from step 02)
- **Task**: Run every checkpoint in `gdd-validation-checklist.md` against the GDD and epics. Cross-check genre conventions against the genre guide. Cross-check complexity expectations against `genre-complexity.csv`.
- **Output format**: Structured findings list with severity (BLOCKER / MAJOR / MINOR / INFO), file path, line/section, evidence, proposed fix.

Tell the subagent: "Return a concise structured findings list, not raw checklist output."

### 2. Triage findings

Walk the findings list with the user:

- **BLOCKER**: must be resolved before the GDD is ready (e.g., genre convention missing, mechanic without pillar, untestable success metric). Resolve in this step.
- **MAJOR**: should be resolved (e.g., vague quantifier, missing assumption tag, engine leakage). Default: fix.
- **MINOR**: cosmetic / consistency (e.g., formatting, missing section header). Default: fix.
- **INFO**: observations to consider (e.g., reference suggestion, alternative phrasing). Optional fix.

Per the project's findings-handling rule (`feedback_findings_default_fix.md`): default = FIX. Defer only for explicit reason and with user approval.

### 3. Apply fixes

Apply approved fixes to `gdd.md` and `epics.md` directly. Record each fix in `decision-log.md` (timestamp + section + finding + fix).

### 4. Re-run validator (if BLOCKER fixes applied)

If any BLOCKER was resolved, spawn the validator again for a second pass against the affected sections. Confirm BLOCKERs are gone.

### 5. Update frontmatter

Update `gdd.md` frontmatter: `stepsCompleted: [1, 2, 3, 4, 5]`. Add `validationDate: {date}` and `validationStatus: {clean | findings-resolved | open-findings}`.

### 6. Branch on intent

If `{INTENT}` is **Validate**, this is the terminal step:
- Always offer to roll findings into an Update — ask the user.
- If declined, this workflow exits here (CHK-WORKFLOW-COMPLETE will be emitted in this step's exit block instead of step-06).

If `{INTENT}` is **Create** or **Update**, continue to step 06.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Validation Pass
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-06-finalize.md | WORKFLOW-COMPLETE (if Validate intent)
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-06-finalize.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
