---
nextStepFile: './step-04-epics.md'
---

# Step 3: Draft GDD Sections

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-02-EXIT emis dans la conversation)
- [ ] `{GAME_TYPE}`, `{COMPLEXITY}`, `{MODE}` bound
- [ ] Genre guide loaded in conversation context

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Draft GDD Sections with {game_type=…, mode=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Walk the GDD section by section with the user, appending each section to `gdd.md` as it is resolved. Follow `templates/gdd-template.md` for the canonical section structure.

## RULES

- **Section structure lives in the template** — `templates/gdd-template.md` encodes the canonical GDD. Treat it as a starting point — adapt depth to game type and scope.
- **Traceability chain holds the GDD together**: Core Fantasy / Vision → Game Pillars → Core Gameplay Loop → Mechanics & Systems → Development Epics. A mechanic that serves no pillar is scope creep in disguise — surface it.
- **2-4 game pillars, each game-defining and distinct.** Pillars must be specific enough to steer decisions, not slogans.
- **Mechanics are measurable player-facing capabilities.** "The jump feels good" is not a spec; "jump height 3 tiles, air time 0.55s, coyote time 6 frames, buffer window 8 frames" is. Replace vague quantifiers ("many enemies", "several weapons") with counts.
- **No engine-implementation leakage.** The GDD specifies WHAT the player experiences and WHAT a system must achieve, not HOW it is built. Engine APIs, node/class names, shaders, netcode libraries, component patterns belong in the architecture document.
- **Genre conventions are documented, not assumed.** High- and medium-complexity genres (rated in `data/genre-complexity.csv`) carry expectations that must be captured.
- **Technical Specifications stay GDD-level.** Performance targets, platform requirements, asset budgets — measurable ("60 FPS sustained on Steam Deck at 720p, measured over a 10-minute combat loop"), not architecture.
- **Information density.** Every sentence carries design weight. Strip pitch-deck language and marketing copy.
- **Out of Scope explicit.** Name what is deliberately cut for v1.0 and what is deferred to post-launch.
- **Never silently de-scope.** Nothing the user explicitly included drops without asking. Propose phasing; never impose it.
- **Assumptions visible.** Inferences without direct user confirmation are tagged `[ASSUMPTION: ...]` inline and indexed at the end. `[NOTE FOR DESIGNER]` callouts mark decision points the user deferred or left tension on.

## SEQUENCE

### 1. Walk the template sections

Read `templates/gdd-template.md`. Walk these sections in order — for each, follow the working mode (`{MODE}`):

- **Express mode**: draft the section from inputs and assumptions, then ask user to validate/adjust.
- **Facilitative mode**: facilitate the design conversation per `references/facilitation-guide.md`, capture decisions in `decision-log.md`, then write the section.

Sections (in template order):

1. **Target Platform(s)** — engines, platforms, certification constraints
2. **Target Audience** — primary / secondary / accessibility considerations
3. **Goals and Context** — why this game exists, market context
4. **Unique Selling Points** — 3-5 distinguishing features
5. **Core Gameplay**:
   - **Game Pillars** (2-4, each distinct)
   - **Core Gameplay Loop** (the moment-to-moment loop, then the session loop)
   - **Win and Loss Conditions** (concrete)
6. **Game Mechanics** — measurable player-facing capabilities (with numbers)
7. **Controls and Input** — inputs / actions / mappings per platform
8. **`{GameType} Specific Design`** — fill from the matched genre guide. Walk each H3 subsection in the guide one at a time.
9. **Progression and Balance** — leveling, unlocks, difficulty curve, pacing
10. **Level Design Framework** — biomes / zones / levels structure, layout principles
11. **Art and Audio Direction** — visual style, references, audio palette, music direction
12. **Technical Specifications** — performance targets, platform requirements, asset budgets
13. **Success Metrics** — measurable goals for v1.0
14. **Out of Scope** — explicit cuts and post-launch deferrals
15. **Assumptions and Dependencies** — index of `[ASSUMPTION]` tags + external dependencies

### 2. Append as you go

After each section is resolved, append it to `gdd.md` immediately. Update `stepsCompleted` only when ALL sections are walked.

For Facilitative mode, log each decision in `decision-log.md` with timestamp, section, decision, rationale.

### 3. Surface traceability gaps

After all sections are appended, do a traceability sweep:

- Every mechanic must serve a pillar or the core loop — surface mechanics that don't (scope creep).
- Every pillar must be reflected in mechanics — surface unfulfilled pillars.
- The core loop must reinforce the pillars — surface mismatches.

Resolve surfaced gaps conversationally with the user, then update the relevant sections.

### 4. Update frontmatter

Update `gdd.md` frontmatter: `stepsCompleted: [1, 2, 3]`.

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Draft GDD Sections
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-04-epics.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-04-epics.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
