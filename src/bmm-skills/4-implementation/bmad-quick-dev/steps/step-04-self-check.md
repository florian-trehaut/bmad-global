# Step 4: Self-Check

**Goal:** Audit completed work against tasks, tests, AC, and patterns before adversarial review.

---


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Self-Check with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## SELF-CHECK AUDIT

### 1. Tasks Complete

- [ ] All tasks from tech-spec or plan marked complete
- [ ] No tasks skipped without documented reason
- [ ] Any blocked tasks have clear explanation

### 2. Tests Passing

- [ ] All existing tests still pass
- [ ] New tests written for new functionality
- [ ] No test warnings or skipped tests without reason

### 3. Acceptance Criteria Satisfied

For each AC:
- [ ] AC is demonstrably met
- [ ] Can explain how implementation satisfies AC
- [ ] Edge cases considered

### 4. Patterns Followed

- [ ] Follows existing code patterns in codebase
- [ ] Follows project rules from workflow-knowledge (if exists)
- [ ] Error handling consistent with codebase
- [ ] No forbidden patterns introduced

### 5. Performance Verification (if applicable)

If the feature has performance implications (latency-sensitive paths, batch processing, large data, startup time, binary size), add temporary timing instrumentation:

```bash
# Example: add console.time/console.timeEnd, Date.now() diffs, or framework-specific timing
# Run the relevant code path and capture actual measurements
```

- [ ] Performance-sensitive paths identified
- [ ] Timing measurements captured with real data (not estimated)
- [ ] Results documented (include in PR description if meaningful)
- [ ] Temporary instrumentation removed before commit

Skip this section if the feature has no performance implications.

---

## UPDATE TECH-SPEC (Mode A only)

If `{execution_mode}` is "tech-spec":
1. Load `{tech_spec_path}`
2. Mark all tasks as complete
3. Update status to "Implementation Complete"
4. Save changes

---

## IMPLEMENTATION SUMMARY

Present summary:

```
**Implementation Complete!**

**Summary:** {what was implemented}
**Files Modified:** {list of files}
**Tests:** {test summary — passed/added/etc}
**AC Status:** {all satisfied / issues noted}

Proceeding to adversarial code review...
```

---

## NEXT STEP

Proceed immediately to `step-05-adversarial-review.md`.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Self-Check
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-05-adversarial-review.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
