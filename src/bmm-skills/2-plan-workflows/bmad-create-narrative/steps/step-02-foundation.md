---
nextStepFile: './step-03-story.md'
outputFile: '{planning_artifacts}/narrative-design.md'
---

# Step 2: Story Foundation

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 02: Story Foundation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Define the narrative foundation: premise, themes, tone/atmosphere, and overall story structure. These elements form the backbone of all narrative content.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- NEVER generate content without user input
- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`
- NEVER mention time estimates

### Role Reinforcement:

- You are a narrative design facilitator
- Help users articulate THEIR story vision
- The premise should come from the user

### Step-Specific Rules:

- FORBIDDEN to generate premise without user input
- Draw out user's ideas through questions
- Themes should resonate with user's intent

## EXECUTION PROTOCOLS:

- Show your analysis before taking any action
- Present A/P/C menu after generating content
- ONLY save when user chooses C (Continue)
- Update frontmatter `stepsCompleted: [1, 2]` before loading next step

## COLLABORATION MENUS (A/P/C):

- **A (Advanced Elicitation)**: Explore themes deeper
- **P (Party Mode)**: Get perspectives on foundation
- **C (Continue)**: Save the content and proceed

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1. Narrative Premise Discovery

"Let's define the narrative foundation for **{{game_name}}**.

**First, the premise - your story's elevator pitch in 2-3 sentences.**

Good premises have:

- A protagonist with a clear goal
- An obstacle or conflict
- Stakes (what happens if they fail?)

**Examples:**

- \"A young knight discovers they're the last hope to stop an ancient evil, but must choose between saving the kingdom or their own family.\"
- \"After a mysterious pandemic, survivors must navigate a world where telling the truth is deadly but lying corrupts your soul.\"

What's the premise for {{game_name}}?"

### 2. Theme Discovery

"**Now let's identify your core themes.**

Themes are the underlying ideas or messages woven throughout the story.

**Common game themes:**

- Redemption, sacrifice, identity
- Power and corruption
- Hope vs. despair
- Nature vs. technology
- Freedom vs. control
- Family, loyalty, betrayal

**Questions to consider:**

- What questions does your story ask?
- What will players think about after playing?
- What emotions do you want to evoke?

What are 2-4 core themes for {{game_name}}?"

### 3. Tone and Atmosphere Discovery

"**Let's define the tone and atmosphere.**

Tone shapes how the story feels moment-to-moment.

**Tone spectrums:**

- Dark ←→ Lighthearted
- Serious ←→ Comedic
- Gritty ←→ Fantastical
- Intimate ←→ Epic
- Hopeful ←→ Melancholic

**Atmosphere elements:**

- Visual mood (colors, lighting)
- Audio mood (music style)
- Pacing (contemplative vs. urgent)
- Emotional register

Describe the tone and atmosphere for {{game_name}}:"

### 4. Story Structure Discovery

"**What story structure will you use?**

**Common structures:**

| Structure          | Description                                            |
| ------------------ | ------------------------------------------------------ |
| **3-Act**          | Setup → Confrontation → Resolution                     |
| **Hero's Journey** | Campbell's monomyth (departure, initiation, return)    |
| **Kishōtenketsu**  | 4-act: Introduction → Development → Twist → Conclusion |
| **Episodic**       | Self-contained episodes with overarching arc           |
| **Branching**      | Multiple paths and endings                             |
| **Freeform**       | Player-driven, emergent narrative                      |

What structure fits {{game_name}}?"

### 5. Act Breakdown

"**Let's break down your story into acts/sections.**

Based on {{selected_structure}}:

{{structure_specific_prompts}}

Describe each act/section for {{game_name}}:"

### 6. Generate Foundation Content

Based on the conversation, prepare the content:

```markdown
## Story Foundation

### Narrative Premise

{{user_premise}}

### Core Themes

{{themes_list_with_descriptions}}

### Tone and Atmosphere

**Tone:** {{tone_description}}

**Atmosphere:** {{atmosphere_description}}

**Emotional Register:** {{emotional_goals}}

---

## Story Structure

### Structure Type

**{{structure_type}}**

{{structure_description}}

### Act Breakdown

{{act_breakdown_details}}
```

### 7. Present Content and Menu

Show the generated content to the user and present:

"I've drafted the Story Foundation based on our conversation.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 6]

**Validation Check:**

- Does the premise capture your vision?
- Do the themes resonate with your intent?
- Does the structure fit your gameplay?

**Select an Option:**
[A] Advanced Elicitation - Explore themes and structure deeper
[P] Party Mode - Get perspectives on foundation
[C] Continue - Save this and move to Story Beats (Step 3 of 11)"

### 8. Handle Menu Selection

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
- Update frontmatter: `stepsCompleted: [1, 2]`
- Load `./step-03-story.md`

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and [foundation content saved with frontmatter updated], will you then load and read fully `./step-03-story.md`.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Premise captured from user input
- Themes identified and described
- Tone and atmosphere defined
- Story structure selected and broken down
- A/P/C menu presented and handled correctly
- Frontmatter updated with stepsCompleted: [1, 2]

### SYSTEM FAILURE:

- Generating premise FOR user
- Generic themes not connected to user's vision
- Proceeding without structure breakdown
- Not presenting A/P/C menu after content
- Proceeding without user selecting 'C'

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 02: Story Foundation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-03-story.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-03-story.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
