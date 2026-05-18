---
nextStepFile: './step-04-observation-guide.md'
outputFile: '{implementation_artifacts}/playtest-plan.md'
---

# Step 3: Design Session Structure

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-02-EXIT emis dans la conversation
- [ ] `{PLAYTEST_TYPE}` bound

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 03: Design Session Structure with {playtest_type=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Design the three-phase session structure: pre-session, gameplay session, post-session. Append to the playtest plan.

## SEQUENCE

### 1. Pre-Session

Define the pre-session activities. Default structure:

1. **Welcome & Context**
   - Brief game description (no spoilers)
   - Session goals (what we are testing)
   - Comfort check (breaks, questions)

2. **Consent & Setup**
   - Recording consent (if applicable)
   - Controller / input preferences
   - Accessibility needs

3. **Instructions**
   - "Play as you normally would"
   - "Think aloud if comfortable"
   - "There are no wrong answers"

Walk with user; adjust per `{PLAYTEST_TYPE}` (internal can be shorter; external requires more formality).

### 2. Gameplay Session

Define the gameplay phase. Default structure:

1. **Observation Focus Areas**
   - Where do players get stuck?
   - What do they try first?
   - What surprises them?
   - Where do they express frustration / joy?

2. **Note-Taking Template**

   ```
   [TIME] [LOCATION] [OBSERVATION] [PLAYER REACTION]
   0:05   Tutorial    Skipped help text    Seemed impatient
   0:12   Combat      Died to first enemy  Frustrated, retried
   ```

3. **Intervention Rules**
   - Let players struggle (within reason)
   - Note when you want to help
   - Only intervene for: critical bugs, genuine distress, session time running out

Walk with user; align observation focus to objectives from step 01.

### 3. Post-Session

Define the post-session phase. Default structure:

1. **Immediate Reactions**
   - "What was your overall impression?"
   - "What stood out most?"
   - "Would you play again?"

2. **Specific Questions**
   - Feature-specific feedback (tie to objectives from step 01)
   - Difficulty perception
   - Clarity of objectives

3. **Open Feedback**
   - "Anything else?"
   - "Questions for us?"

### 4. Update output document

Update frontmatter `stepsCompleted: [1, 2, 3]`.

Append to `{outputFile}`:

```markdown
## Session Structure

### Pre-Session

{pre-session items}

### Gameplay Session

**Observation Focus:** {focus areas}
**Intervention Rules:** {rules}

### Post-Session

{post-session items}

---
```

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 03: Design Session Structure
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-04-observation-guide.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-04-observation-guide.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
