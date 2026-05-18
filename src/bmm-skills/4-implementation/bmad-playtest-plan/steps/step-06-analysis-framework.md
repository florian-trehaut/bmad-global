---
outputFile: '{implementation_artifacts}/playtest-plan.md'
---

# Step 6: Post-Playtest Analysis Framework

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-05-EXIT emis dans la conversation
- [ ] Playtest plan complete in `{outputFile}` (status: ready-to-run)

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 06: Post-Playtest Analysis Framework with {output_file=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Append the post-playtest analysis framework — how findings will be synthesized, severity assessed, and reports written. Finalize the document and present deliverables.

## SEQUENCE

### 1. Append the analysis framework

Append to `{outputFile}`:

```markdown
## Post-Playtest Analysis Framework

### Synthesize Findings

1. **Pattern Identification**
   - What issues appeared multiple times?
   - What worked consistently well?

2. **Severity Assessment**
   - Critical: Blocks progression
   - Major: Significantly impacts experience
   - Minor: Noticeable but manageable

3. **Recommendations**
   - Immediate fixes
   - Design considerations
   - Further investigation needed

### Report Template

```markdown
## Playtest Report: {Session}

### Summary

- Participants: {count}
- Completion rate: {%}
- Overall sentiment: {positive/mixed/negative}

### Key Findings

1. {Finding with evidence}
2. {Finding with evidence}

### Recommendations

| Issue   | Severity | Recommendation | Priority |
| ------- | -------- | -------------- | -------- |
| {issue} | {sev}    | {rec}          | {P0-P3}  |

### Quotes

> "{Notable player quote}" - Participant {N}

### Next Steps

1. {action item}
2. {action item}
```
```

### 2. Validate against checklist

Read `data/checklist.md`. Walk through each item:

- Are objectives clearly defined?
- Is the playtest type confirmed with rationale?
- Are participants/criteria specified?
- Is the session structure complete (pre / gameplay / post)?
- Is the observation guide actionable?
- Are metrics tied to decisions?
- Are team roles assigned?
- Is the analysis framework defined?

For each "no", resolve before finalizing.

### 3. Finalize

Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6]`, `status: 'final'`, `finalized: {date}`.

### 4. Present deliverables

Tell the user:

> "Playtest plan finalized at `{outputFile}`. The plan covers:
> 1. Objectives (what we test, decisions it informs, metrics)
> 2. Type and participant criteria
> 3. Session structure (pre / gameplay / post)
> 4. Observation guide (qualitative + quantitative)
> 5. Plan document (data collection, team roles, logistics)
> 6. Post-playtest analysis framework
>
> Next: run the playtest sessions using this plan as the operational guide. After the sessions, generate the report using the embedded template."

---

## END OF WORKFLOW

The bmad-playtest-plan workflow is complete.

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 06: Post-Playtest Analysis Framework
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: WORKFLOW-COMPLETE
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-playtest-plan executed end-to-end:
  steps_executed: ['01', '02', '03', '04', '05', '06']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: ['{implementation_artifacts}/playtest-plan.md']
```

Si steps_executed != ['01', '02', '03', '04', '05', '06'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
