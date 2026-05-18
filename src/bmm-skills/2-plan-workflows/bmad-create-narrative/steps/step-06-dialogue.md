---
nextStepFile: './step-07-environmental.md'
outputFile: '{planning_artifacts}/narrative-design.md'
---

# Step 6: Dialogue Systems

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 06: Dialogue Systems with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Define dialogue style, key conversations, and branching dialogue systems if applicable.

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
- Dialogue is how characters come alive
- Style should match tone and setting

### Step-Specific Rules:

- FORBIDDEN to write dialogue without user direction
- Define style and systems, not actual dialogue
- Consider technical implementation implications

## EXECUTION PROTOCOLS:

- Show your analysis before taking any action
- Present A/P/C menu after generating content
- ONLY save when user chooses C (Continue)
- Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6]` before loading next step

## COLLABORATION MENUS (A/P/C):

- **A (Advanced Elicitation)**: Explore dialogue depth
- **P (Party Mode)**: Get perspectives on dialogue approach
- **C (Continue)**: Save the content and proceed

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1. Dialogue Style Discovery

"**Let's define how characters speak in {{game_name}}.**

**Style considerations:**

| Aspect        | Options                      |
| ------------- | ---------------------------- |
| **Formality** | Formal ←→ Casual             |
| **Period**    | Period-appropriate ←→ Modern |
| **Length**    | Verbose ←→ Concise           |
| **Humor**     | Serious ←→ Comedic           |
| **Profanity** | None ←→ Heavy                |

**Questions:**

- How do different characters speak differently?
- Are there speech patterns or verbal tics?
- What's the overall voice of the game?

Describe your dialogue style:"

### 2. Key Conversations Discovery

"**List key conversations/dialogue moments.**

For each important conversation:

- **Who is involved?**
- **When does it occur?**
- **What's discussed?**
- **Narrative purpose** - What does it accomplish?
- **Emotional tone**

What are the key conversations in {{game_name}}?"

### 3. Branching Dialogue Discovery

"**Does {{game_name}} have branching dialogue?**

If yes, describe:

- **How many branches/paths?**
- **What determines branches?** (player choice, stats, flags)
- **Do branches converge or stay separate?**
- **How much unique dialogue?**
- **What are the consequences of choices?**

Describe your branching system (or indicate N/A):"

### 4. Generate Dialogue Content

Based on the conversation, prepare the content:

```markdown
## Dialogue Framework

### Dialogue Style

**Overall Voice:** {{dialogue_voice}}

**Style Elements:**

- Formality: {{formality_level}}
- Period: {{period_style}}
- Verbosity: {{verbosity}}
- Humor: {{humor_level}}
- Profanity: {{profanity_level}}

**Character Voice Distinctions:**
{{how_characters_differ}}

---

### Key Conversations

{{for_each_conversation}}

#### {{conversation_name}}

**Participants:** {{who}}
**When:** {{timing}}
**Topic:** {{what_discussed}}
**Purpose:** {{narrative_function}}
**Tone:** {{emotional_tone}}
{{/for_each}}

---

### Branching Dialogue System

{{if_branching}}
**System Type:** {{branching_type}}

**Branch Triggers:** {{what_causes_branches}}

**Branch Scope:**

- Total branches: {{branch_count}}
- Convergence: {{do_they_converge}}
- Unique content: {{percentage_unique}}

**Consequence System:**
{{how_choices_matter}}
{{/if_branching}}

{{if_not_branching}}
**System:** Linear dialogue
**Notes:** {{why_linear}}
{{/if_not_branching}}
```

### 5. Present Content and Menu

Show the generated content to the user and present:

"I've documented the dialogue framework.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 4]

**Dialogue Summary:**

- Style: {{style_summary}}
- Key conversations: {{count}}
- Branching: {{yes_no}}

**Validation Check:**

- Does style match your tone?
- Are key conversations identified?
- Is branching scope realistic?

**Select an Option:**
[A] Advanced Elicitation - Explore dialogue depth
[P] Party Mode - Get perspectives on dialogue approach
[C] Continue - Save this and move to Environmental Storytelling (Step 7 of 11)"

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
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6]`
- Load `./step-07-environmental.md`

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and [dialogue content saved with frontmatter updated], will you then load and read fully `./step-07-environmental.md`.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Dialogue style clearly defined
- Key conversations identified
- Branching system documented (if applicable)
- Style matches game tone
- A/P/C menu presented and handled correctly
- Frontmatter updated with stepsCompleted: [1, 2, 3, 4, 5, 6]

### SYSTEM FAILURE:

- Writing actual dialogue without direction
- Style disconnected from tone
- Missing branching documentation
- Not presenting A/P/C menu after content
- Proceeding without user selecting 'C'

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 06: Dialogue Systems
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-07-environmental.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-07-environmental.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
