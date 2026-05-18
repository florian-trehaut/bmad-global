---
nextStepFile: './step-03-draft.md'
---

# Step 2: Discovery — Game Type, Inputs, Scope, Downstream Depth

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-01-EXIT emis dans la conversation)
- [ ] `{INTENT}` bound
- [ ] `{DOC_WORKSPACE}` bound

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Discovery with {intent=…, doc_workspace=…}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Run the four-dimensional Discovery: game type, existing inputs, scope and stakes, downstream depth. Match the game type to a row in `data/game-types.csv`, load the matched genre guide, and pick the working mode (Express or Facilitative).

## RULES

- Open with space for the full picture. Invite a brain dump, inputs, ideas, the game the user sees in their head and WHY it matters. After the dump, a simple "anything else?" often surfaces what they almost forgot.
- Match the game type by scanning the user's pitch against `data/game-types.csv` (columns: `id`, `name`, `description`, `genre_tags`, `fragment_file`); present the matched type with the signals that matched.
- Watch for a stronger competing match; present alternatives if any are close.
- Read the matched genre guide (`data/game-types/{fragment_file}`) — it scaffolds the `{GameType} Specific Design` section.
- Check `data/genre-complexity.csv` for the matched genre's complexity rating.

## SEQUENCE

### 1. Open with space

Ask the user for a brain dump — the game they see in their head, WHY it matters to them, and any inputs they have. Capture this verbatim in `decision-log.md` under "## Discovery — Brain Dump".

If `gds-create-game-brief` output or prior GDD exists (from step 01 input registration), spawn a subagent to extract the core fantasy, audience, hook, references, called-out mechanics, and scope constraints. Use these to frame Discovery around what is new or still open.

### 2. Game type — the single highest-leverage read

Match the user's pitch against `data/game-types.csv` by scanning for genre signals (use the `description` and `genre_tags` columns).

Present the matched type to the user with the signals that matched:

> "Based on '[user phrase]', this looks like a **[matched name]** — [one-line description from CSV]. Does that match what you're going for? If a different type fits better (e.g., '[close alternative]'), say so."

If the user confirms, bind `{GAME_TYPE}` to the matched row.

If the user disputes, list the top 2-3 candidates from the CSV and let them pick.

If no match is plausible: HALT — "I can't match your gameplay description to any game type in our library. Can you describe the core gameplay loop more specifically (what does the player DO moment to moment)?"

### 3. Genre complexity

Load `data/genre-complexity.csv`. Find the matched `{GAME_TYPE}` in it. Bind `{COMPLEXITY}` to the complexity rating (low / medium / high).

Tell the user:

> "[Game Type] is rated **{COMPLEXITY}** complexity. [If high]: This carries genre conventions that we must document explicitly — missing them surfaces as emergencies during production."

### 4. Load the matched genre guide

Read `data/game-types/{fragment_file}` from the matched CSV row.

This guide scaffolds the `{GameType} Specific Design` H2 section. Its H3 subsections will be walked one at a time with the user in step 03.

Check the guide's opening lines for narrative flags:
- `<narrative-workflow-critical>` or `<narrative-workflow-recommended>` → set `needs_narrative = true` and tell the user dedicated narrative design will be offered at Finalize.

### 5. Read scope and stakes

Ask the user:

> "Is this a **solo prototype**, a small team build, or a **funded team** build heading to commercial release? This calibrates section depth, epic granularity, and how much rigor the technical and metrics sections warrant."

Record `{SCOPE}` in `decision-log.md` and the GDD frontmatter.

### 6. Read downstream depth

The GDD heads into `bmad-create-architecture` (or `bmad-agent-game-architect`) → `bmad-create-epics-and-stories` → production. Confirm with the user the depth needed:

- Mechanics need enough precision for architecture to make engine/system decisions
- Epics need enough shape for story creation

If the user is going solo and skipping architecture/epics, lighter epic granularity is acceptable.

### 7. Pick working mode

Offer the user a choice (one sentence per option):

- **Express**: Resolve any remaining critical gaps in a short batch, then draft the full GDD at once.
- **Facilitative**: Work through the sections that require design thinking before drafting, using the techniques in `references/facilitation-guide.md`. Capture all decisions in the log, section to section.

Bind `{MODE}` to the user's choice.

In Facilitative mode, the GDD is drafted after the key sections (pillars, core loop, mechanics, the genre-specific section) are walked.

### 8. Append Discovery summary to the GDD

Append to `gdd.md`:

```markdown
## Executive Summary

- **Game Type:** {GAME_TYPE}
- **Genre Complexity:** {COMPLEXITY}
- **Scope:** {SCOPE}
- **Working Mode:** {MODE}
- **Needs Narrative:** {needs_narrative}

[1-2 sentence vision statement from user brain dump]
```

Update frontmatter `stepsCompleted: [1, 2]`.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Discovery
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./steps/step-03-draft.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-03-draft.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
