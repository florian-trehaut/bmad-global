---
nextStepFile: './step-03-session-structure.md'
outputFile: '{implementation_artifacts}/playtest-plan.md'
---

# Step 2: Choose Playtest Type

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] CHK-STEP-01-EXIT emis dans la conversation
- [ ] Objectives section appended to `{outputFile}`

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 02: Choose Playtest Type with {objectives=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Present the three playtest types to the user, recommend one based on objectives, confirm the user's choice, and capture participant criteria.

## SEQUENCE

### 1. Present types

Show the three options with trade-offs:

#### Internal Playtest
**Best for:** Early validation, bug finding, quick iterations

| Aspect       | Details                   |
| ------------ | ------------------------- |
| Participants | Team members, other teams |
| Duration     | Short, repeatable         |
| Frequency    | Weekly or per-milestone   |
| Setup        | Minimal, informal         |

#### External Playtest
**Best for:** Unbiased feedback, market validation

| Aspect       | Details                           |
| ------------ | --------------------------------- |
| Participants | Target audience, external testers |
| Duration     | Longer, single session            |
| Frequency    | Monthly or milestone              |
| Setup        | Formal, NDA if needed             |

#### Focused Playtest
**Best for:** Specific feature validation

| Aspect       | Details                      |
| ------------ | ---------------------------- |
| Participants | Selected for specific traits |
| Duration     | Shorter, single feature      |
| Frequency    | As needed                    |
| Setup        | Specific build/scenario      |

### 2. Recommend based on objectives

Read the Objectives section from step 01. Recommend:

- Decisions are "ship/no-ship" or "market readiness" → **External**
- Decisions are "feature prioritization" or "specific design tweak" → **Focused**
- Decisions are "quick iteration", "find bugs", or "team feedback" → **Internal**

### 3. Confirm with user

Show recommendation, ask user to confirm or override.

Bind `{PLAYTEST_TYPE}` to the user's choice.

### 4. Capture participant criteria

For the chosen type, ask:

- **Target player profile**: gameplay experience, demographic if relevant, accessibility needs
- **Participant count**: how many sessions can be run / desired sample size
- **NDA / consent**: required? (always required for external)

### 5. Update output document

Update frontmatter `playtestType: {PLAYTEST_TYPE}`, `stepsCompleted: [1, 2]`.

Append to `{outputFile}`:

```markdown
## Playtest Type

**Type:** {PLAYTEST_TYPE}

**Participant Criteria:**

- Target profile: {profile}
- Count: {count}
- NDA / consent: {yes/no}

---
```

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 02: Choose Playtest Type
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-03-session-structure.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-03-session-structure.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
