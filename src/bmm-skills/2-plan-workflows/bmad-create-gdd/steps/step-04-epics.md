---
nextStepFile: './step-05-validate.md'
---

# Step 4: Development Epics

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-03-EXIT emis dans la conversation)
- [ ] All main GDD sections appended to `gdd.md`
- [ ] Traceability sweep complete (mechanics ↔ pillars validated)

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Development Epics with {scope=…, doc_workspace=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Build the development-epic and high-level-story breakdown. Write the detailed breakdown to `epics.md` and a summary table to `gdd.md` under "Development Epics".

## RULES

- The GDD's "Development Epics" section carries the **summary table and sequence only** (one-screen view). The detailed breakdown lives in `epics.md` in the same folder.
- Each epic delivers a coherent slice of mechanics, levels, or systems — not a phase of work.
- Each epic must trace back to at least one pillar or mechanic in the GDD — no epic exists without a design rationale.
- Epic granularity depends on `{SCOPE}`:
  - Solo prototype: 3-5 epics, lightweight stories under each
  - Small team: 5-8 epics with high-level stories
  - Funded team: 6-12 epics with detailed high-level stories
- The high-level-story breakdown under each epic is at the "story candidate" level — story creation will be done by `bmad-create-epics-and-stories` downstream.

## SEQUENCE

### 1. Walk the design surface

Re-read the GDD sections appended in step 03 (mechanics, genre-specific design, progression, level design). Identify the implementation surface — what systems, levels, mechanics, polish layers must be built?

### 2. Propose epic breakdown

Propose `{N}` epics to the user (where `{N}` matches the scope: 3-5 / 5-8 / 6-12). For each epic, propose:

- **Title** — short, action-oriented
- **Goal** — what the epic delivers as a coherent player-facing increment
- **Pillars served** — which game pillars this epic embodies
- **High-level stories** — 3-7 story candidates per epic, each one sentence

Walk the breakdown with the user. Accept revisions.

### 3. Sequence the epics

Propose an epic sequence (which comes first, what depends on what). Common patterns:

- Foundation first: core loop / movement / input → first vertical slice
- Mechanics ladder: simple mechanics before composite ones
- Progression last: unlocks and curves layered on top of working mechanics
- Polish at end: art / audio polish phase after gameplay is locked

Capture the rationale for the chosen sequence in `decision-log.md`.

### 4. Write `epics.md`

Create `{DOC_WORKSPACE}/epics.md` with:

```markdown
---
title: Development Epics
project: {project_name}
gdd: ./gdd.md
created: {date}
updated: {date}
---

# Development Epics — {project_name}

## Epic Sequence

{summary of the order with rationale}

---

## Epic 1: {Title}

**Goal:** {goal}

**Pillars served:** {pillar 1, pillar 2}

**High-level stories:**

1. {story 1}
2. {story 2}
3. ...

**Dependencies:** {prior epics or external deps}

**Acceptance signal:** {what tells us this epic is done}

---

## Epic 2: {Title}

...
```

### 5. Append the summary table to `gdd.md`

In the "Development Epics" section of `gdd.md`, append a summary table only:

```markdown
## Development Epics

The detailed breakdown lives in `epics.md`.

| # | Epic | Goal | Pillars served | Acceptance signal |
|---|------|------|----------------|-------------------|
| 1 | {title} | {one line} | {pillar list} | {one line} |
| ... |
```

Plus a short paragraph capturing the rationale of the sequence.

### 6. Update frontmatter

Update `gdd.md` frontmatter: `stepsCompleted: [1, 2, 3, 4]`. Add `epicsFile: ./epics.md`.

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Development Epics
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-05-validate.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-05-validate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
