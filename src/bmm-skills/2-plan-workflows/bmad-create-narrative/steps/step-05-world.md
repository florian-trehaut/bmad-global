---
nextStepFile: './step-06-dialogue.md'
outputFile: '{planning_artifacts}/narrative-design.md'
---

# Step 5: World Building

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 05: World-Building with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Build the game's world including setting, history/backstory, factions/organizations, and key locations where the narrative unfolds.

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
- World should support and enhance the story
- Draw out user's vision of their world

### Step-Specific Rules:

- FORBIDDEN to create world elements without user input
- Connect world to themes and story
- Focus on narrative-relevant world-building

## EXECUTION PROTOCOLS:

- Show your analysis before taking any action
- Present A/P/C menu after generating content
- ONLY save when user chooses C (Continue)
- Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5]` before loading next step

## COLLABORATION MENUS (A/P/C):

- **A (Advanced Elicitation)**: Explore world depth
- **P (Party Mode)**: Get perspectives on world-building
- **C (Continue)**: Save the content and proceed

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1. World Overview Discovery

"**Let's build the world of {{game_name}}.**

Describe your world:

- **Setting** - Where and when does this take place?
- **World type** - Fantasy, sci-fi, modern, historical, etc.
- **World rules** - Magic systems? Technology level? Physical laws?
- **Atmosphere** - What mood does the world evoke?
- **What makes it unique?**

Describe the world:"

### 2. History and Backstory Discovery

"**What's the history of your world?**

Consider:

- **Major historical events** - Wars, discoveries, cataclysms?
- **How did the world reach its current state?**
- **Legends and myths** - What do people believe?
- **Past conflicts** - What shaped the present?
- **Secrets** - What is hidden or forgotten?

Describe the history:"

### 3. Factions Discovery (Optional)

"**Are there factions, organizations, or groups?** (Optional)

If applicable, for each faction:

- **Name and purpose**
- **Leadership and structure**
- **Goals and methods**
- **Relationships with other factions**
- **Role in the story**

Describe any factions:"

### 4. Locations Discovery

"**Describe the key locations in your world.**

For each significant location:

- **Name and description**
- **Narrative significance** - Why does it matter to the story?
- **Atmosphere and mood**
- **Key events that occur there**
- **Who controls/inhabits it?**

What are the key locations?"

### 5. Generate World Content

Based on the conversation, prepare the content:

```markdown
## World Building

### World Overview

**Setting:** {{setting_description}}

**World Type:** {{world_type}}

**World Rules:**
{{rules_and_systems}}

**Atmosphere:** {{world_atmosphere}}

**Unique Elements:** {{what_makes_it_unique}}

---

### History and Backstory

**Timeline Overview:**
{{historical_timeline}}

**Major Events:**
{{significant_events}}

**Legends and Myths:**
{{beliefs_and_legends}}

**Hidden Secrets:**
{{world_secrets}}

---

### Factions and Organizations

{{for_each_faction}}

#### {{faction_name}}

**Purpose:** {{purpose}}
**Leadership:** {{leadership}}
**Goals:** {{goals}}
**Methods:** {{methods}}
**Relationships:** {{faction_relationships}}
**Story Role:** {{narrative_function}}
{{/for_each}}

---

### Key Locations

{{for_each_location}}

#### {{location_name}}

**Description:** {{description}}
**Narrative Significance:** {{why_important}}
**Atmosphere:** {{mood}}
**Key Events:** {{events_here}}
**Inhabitants:** {{who_is_here}}
{{/for_each}}
```

### 6. Present Content and Menu

Show the generated content to the user and present:

"I've documented the world of {{game_name}}.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 5]

**World Summary:**

- Setting: {{setting}}
- Factions: {{count}}
- Key locations: {{count}}

**Validation Check:**

- Does the world support your themes?
- Are locations narratively significant?
- Is history relevant to the present story?

**Select an Option:**
[A] Advanced Elicitation - Explore world depth
[P] Party Mode - Get perspectives on world-building
[C] Continue - Save this and move to Dialogue Systems (Step 6 of 11)"

### 7. Handle Menu Selection

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
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5]`
- Load `./step-06-dialogue.md`

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and [world content saved with frontmatter updated], will you then load and read fully `./step-06-dialogue.md`.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- World setting clearly defined
- History connects to current story
- Factions developed (if applicable)
- Locations are narratively significant
- A/P/C menu presented and handled correctly
- Frontmatter updated with stepsCompleted: [1, 2, 3, 4, 5]

### SYSTEM FAILURE:

- Creating world without user input
- World disconnected from story
- Generic locations without significance
- Not presenting A/P/C menu after content
- Proceeding without user selecting 'C'

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 05: World-Building
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-06-dialogue.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-06-dialogue.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
