---
nextStepFile: './step-02-type.md'
outputFile: '{implementation_artifacts}/playtest-plan.md'
templateFile: '../templates/playtest-template.md'
---

# Step 1: Define Playtest Objectives

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-INIT PASSED emis dans workflow.md INIT
- [ ] `{project_name}`, `{user_name}`, `{COMMUNICATION_LANGUAGE}` bound

Emettre EXACTEMENT:

```
CHK-STEP-01-ENTRY PASSED — entering Step 01: Define Playtest Objectives with {project_name=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Define what we are testing, what decisions the playtest will inform, and what metrics we will collect. These are the contract for the playtest — without them the session has no anchor.

## RULES

- Ask the user; infer from the GDD or game brief only if the user signals they want defaults.
- Do not propose generic metrics — they must tie to the playtest's specific decision context.
- HALT if the user cannot articulate at least one decision the playtest must inform — without a target decision, the playtest is observation theatre.

## SEQUENCE

### 1. Search for input context

Look for `*gdd*.md` or `*gdd*/*.md` in `{planning_artifacts}/**` — extract mechanics being tested.
Look for `*brief*.md` in `{planning_artifacts}/**` — extract core pillars and target audience.

If neither exists, note it and proceed with user-supplied context only.

### 2. Ask the user (or infer)

Walk these three questions:

**Q1. What are we testing?**

- Core gameplay loop
- Specific feature (name it)
- Difficulty curve
- Tutorial effectiveness
- Overall experience

Capture the answer.

**Q2. What decisions will this inform?**

- Design changes
- Difficulty tuning
- Feature prioritization
- Ship / no-ship decision

Capture the answer. If the user cannot name at least one concrete decision, ask follow-up questions until they can. HALT otherwise.

**Q3. What metrics will we collect?**

- Completion rates
- Time-on-task
- Failure points
- Player sentiment

Capture the answer. Metrics must tie to Q2's decision (e.g., "difficulty tuning" → "completion rate per level + time-to-completion + retries").

### 3. Initialize the playtest plan document

Create `{outputFile}` from `{templateFile}` with frontmatter:

```markdown
---
title: 'Playtest Plan'
project: '{project_name}'
date: '{current_date}'
author: '{user_name}'
playtestType: 'undetermined'
testObjectives:
  testing: '{from Q1}'
  decisions: '{from Q2}'
  metrics: '{from Q3}'
stepsCompleted: [1]
status: 'in-progress'
---
```

Append the Objectives section:

```markdown
## Objectives

**What we test:** {Q1 answer}

**Decisions this informs:** {Q2 answer}

**Metrics we collect:** {Q3 answer}

---
```

---

## STEP EXIT (CHK-STEP-01-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01-EXIT PASSED — completed Step 01: Define Playtest Objectives
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-02-type.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-02-type.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
