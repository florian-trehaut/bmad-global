---
nextStepFile: './step-10-production.md'
outputFile: '{planning_artifacts}/narrative-design.md'
---

# Step 9: Gameplay Integration

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-09-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-09-ENTRY PASSED — entering Step 09: Gameplay Integration with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Define how narrative integrates with gameplay: story-gameplay connection, progression gating, and player agency within the narrative.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- YOU ARE A FACILITATOR, not a content generator
- NEVER mention time estimates
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- You are a narrative design facilitator
- Ludonarrative harmony matters
- Story and gameplay should reinforce each other

### Step-Specific Rules:

- FORBIDDEN to design integration without user input
- Consider player experience flow
- Address potential ludonarrative dissonance

## EXECUTION PROTOCOLS:

- Show your analysis before taking any action
- Present A/P/C menu after generating content
- ONLY save when user chooses C (Continue)
- Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]` before loading next step

## COLLABORATION MENUS (A/P/C):

- **A (Advanced Elicitation)**: Explore integration depth
- **P (Party Mode)**: Get perspectives on integration
- **C (Continue)**: Save the content and proceed

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1. Narrative-Gameplay Connection Discovery

"**How does narrative integrate with gameplay in {{game_name}}?**

**Integration questions:**

- Does story unlock new mechanics or abilities?
- Do mechanics reflect the themes?
- Is there harmony between what player DOES and what story SAYS?
- What's the balance of story vs. gameplay sections?

**Ludonarrative consideration:**
Games work best when mechanics and narrative tell the same story. A game about pacifism shouldn't require combat.

Describe how narrative and gameplay connect:"

### 2. Story Gating Discovery

"**How does story gate progression?**

**Gating types:**

- **Hard gates** - Must complete story to proceed
- **Soft gates** - Story available but optional
- **Skill gates** - Narrative rewards for mastery
- **Exploration gates** - Story found through exploring

**Questions:**

- What areas are story-locked?
- What triggers cutscenes?
- What story beats are mandatory?
- What's optional vs. required?

How does story gate progress in {{game_name}}?"

### 3. Player Agency Discovery

"**How much narrative agency does the player have?**

**Agency spectrum:**

- **Full agency** - Player creates their own story
- **Meaningful choices** - Player shapes outcomes
- **Flavor choices** - Player affects tone, not outcome
- **Witness** - Player observes a fixed story

**Questions:**

- Can player affect the story?
- Are choices meaningful or cosmetic?
- How much role-playing freedom?
- Is the narrative predetermined or dynamic?

Describe player agency in {{game_name}}:"

### 4. Generate Integration Content

Based on the conversation, prepare the content:

```markdown
## Gameplay Integration

### Narrative-Gameplay Connection

**Integration Approach:**
{{integration_description}}

**Mechanic-Theme Alignment:**
{{how_mechanics_reflect_themes}}

**Story-Gameplay Balance:**
{{balance_description}}

**Ludonarrative Considerations:**
{{harmony_or_dissonance_notes}}

---

### Story Gating

**Gating Approach:** {{gating_type}}

**Story-Locked Elements:**
{{what_requires_story_progress}}

**Cutscene Triggers:**
{{when_cutscenes_play}}

**Mandatory Story Beats:**
{{required_narrative_content}}

**Optional Narrative:**
{{skippable_content}}

---

### Player Agency

**Agency Level:** {{agency_type}}

**Player Influence:**
{{what_player_can_affect}}

**Choice System:**
{{if_has_choices}}

- Choice types: {{choice_types}}
- Consequence scope: {{how_choices_matter}}
- Timing: {{when_choices_occur}}
  {{/if_has_choices}}

**Role-Playing Freedom:**
{{roleplay_options}}
```

### 5. Present Content and Menu

Show the generated content to the user and present:

"I've documented the gameplay-narrative integration.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 4]

**Integration Summary:**

- Connection: {{integration_type}}
- Gating: {{gating_approach}}
- Agency: {{agency_level}}

**Validation Check:**

- Do mechanics support themes?
- Is gating appropriate for your game?
- Is agency level what you want?

**Select an Option:**
[A] Advanced Elicitation - Explore integration depth
[P] Party Mode - Get perspectives on integration
[C] Continue - Save this and move to Production Planning (Step 10 of 11)"

### 6. Handle Menu Selection

#### IF A (Advanced Elicitation):

- Execute `~/.claude/skills/bmad-advanced-elicitation/SKILL.md` with the current content
- Ask user: "Accept these changes? (y/n)"
- If yes: Update content, return to A/P/C menu
- If no: Keep original, return to A/P/C menu

#### IF P (Party Mode):

- Execute `~/.claude/skills/bmad-party-mode/SKILL.md` with the current content
- Ask user: "Accept these changes? (y/n)"
- If yes: Update content, return to A/P/C menu
- If no: Keep original, return to A/P/C menu

#### IF C (Continue):

- Append the final content to `{outputFile}`
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]`
- Load `./step-10-production.md`

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and [integration content saved with frontmatter updated], will you then load and read fully `./step-10-production.md`.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Narrative-gameplay connection defined
- Gating structure documented
- Player agency level established
- Ludonarrative harmony considered
- A/P/C menu presented and handled correctly
- Frontmatter updated with stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]

### SYSTEM FAILURE:

- Designing integration without user input
- Ignoring ludonarrative harmony
- Missing agency documentation
- Not presenting A/P/C menu after content
- Proceeding without user selecting 'C'

## STEP EXIT (CHK-STEP-09-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-09-EXIT PASSED — completed Step 09: Gameplay Integration
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-10-production.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-10-production.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
