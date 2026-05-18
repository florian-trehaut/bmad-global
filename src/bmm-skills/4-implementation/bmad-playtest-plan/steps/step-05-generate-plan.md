---
nextStepFile: './step-06-analysis-framework.md'
outputFile: '{implementation_artifacts}/playtest-plan.md'
templateFile: '../templates/playtest-template.md'
---

# Step 5: Generate Plan Document

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-04-EXIT emis dans la conversation
- [ ] Objectives, Type, Session Structure, Observation Guide all in `{outputFile}`

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 05: Generate Plan Document with {output_file=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Complete the playtest plan document by adding the operational sections — data collection, team roles, logistics. The document is the artifact the facilitators will use during the session.

## SEQUENCE

### 1. Read the template

Read `{templateFile}` — it provides the canonical structure for the operational sections.

### 2. Complete remaining sections

Append to `{outputFile}` (the sections that were not built in steps 01-04):

```markdown
## Overview

- Build version: {version}
- Session date(s): {dates}
- Objective: {primary goal from step 01}

## Data Collection

- Recording: {yes/no}
- Notes template: {attached}
- Metrics: {list — from step 04}

## Team Roles

- Facilitator: {name}
- Note-taker: {name}
- Technical support: {name}

## Logistics

- Build location: {where is the playable build}
- Hardware: {input devices, headsets, etc.}
- Recording setup: {tools, consent forms}
- Backup plan: {if build crashes, if participant cancels}
```

### 3. Walk the document with the user

Read the full document back to the user. Confirm:
- All sections are concrete (no `[TBD]` placeholders)
- Names are filled in for team roles
- Dates and build versions are real

If anything is undetermined, surface and resolve.

### 4. Update output document

Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5]`, `status: 'ready-to-run'`.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 05: Generate Plan Document
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-06-analysis-framework.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-06-analysis-framework.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
