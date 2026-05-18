---
nextStepFile: './step-05-generate-plan.md'
outputFile: '{implementation_artifacts}/playtest-plan.md'
---

# Step 4: Build Observation Guide

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-03-EXIT emis dans la conversation
- [ ] Session structure appended to `{outputFile}`

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 04: Build Observation Guide with {objectives=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Build the observation guide — concrete signals to watch for, with categories, signals, what to record. Plus quantitative metrics tied to the objectives.

## SEQUENCE

### 1. Define observation categories

Default categories — adjust per objectives:

| Category    | Signals                               | Record             |
| ----------- | ------------------------------------- | ------------------ |
| Confusion   | Pausing, wandering, repeating actions | Location, duration |
| Frustration | Sighing, repeated failures, quitting  | Cause, frequency   |
| Engagement  | Leaning in, exclaiming, continuing    | Features that work |
| Boredom     | Checking phone, disengaging           | Drop-off points    |

### 2. Define quantitative metrics

Bind to the metrics defined in step 01 (Q3). Common metrics:

- Time to complete tutorial
- Deaths per section
- Items / features discovered
- Session duration
- Completion rate

For each metric, define:
- How it is measured (manual observation / build instrumentation / both)
- What unit of analysis (per-session / per-player / aggregate)

### 3. Update output document

Update frontmatter `stepsCompleted: [1, 2, 3, 4]`.

Append to `{outputFile}`:

```markdown
## Observation Guide

### Qualitative Signals

| Category | Signals | Record |
|----------|---------|--------|
| {category} | {signals} | {record} |

### Quantitative Metrics

| Metric | Measurement | Unit of Analysis |
|--------|-------------|------------------|
| {metric} | {how} | {unit} |

---
```

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 04: Build Observation Guide
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-05-generate-plan.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-05-generate-plan.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
