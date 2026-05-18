---
nextStepFile: './step-11-complete.md'
outputFile: '{planning_artifacts}/narrative-design.md'
---

# Step 10: Production Planning

## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-10-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-10-ENTRY PASSED — entering Step 10: Production Planning with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Plan the production scope for narrative content: writing scope estimates, localization considerations, and voice acting plans.

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
- Production planning ensures realistic scope
- Help user understand what they're committing to

### Step-Specific Rules:

- FORBIDDEN to estimate scope without user input
- Help user think through production needs
- Be realistic about effort required

## EXECUTION PROTOCOLS:

- Show your analysis before taking any action
- Present A/P/C menu after generating content
- ONLY save when user chooses C (Continue)
- Update frontmatter `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` before loading next step

## COLLABORATION MENUS (A/P/C):

- **A (Advanced Elicitation)**: Explore production details
- **P (Party Mode)**: Get perspectives on scope
- **C (Continue)**: Save the content and proceed

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1. Writing Scope Discovery

"**Let's estimate the writing scope for {{game_name}}.**

**Scope elements:**

- **Word count estimate** - Total written content
- **Scene/chapter count** - Major narrative sections
- **Dialogue lines** - Approximate line count
- **Branching complexity** - How much unique content per path?

**For reference:**

- Light narrative game: ~5,000-15,000 words
- Moderate narrative: ~15,000-50,000 words
- Heavy narrative: ~50,000-150,000 words
- Story-driven/Visual novel: 100,000+ words

Estimate your writing scope:"

### 2. Localization Discovery

"**Are you planning localization?**

**Localization considerations:**

- **Target languages** - Which languages?
- **Cultural adaptation** - What needs to change per region?
- **Text expansion** - Some languages use 30% more space
- **UI implications** - Can UI handle longer text?
- **Audio implications** - Will you dub or subtitle?

Describe your localization plans (or indicate English-only):"

### 3. Voice Acting Discovery

"**What are your voice acting plans?**

**Voice acting scope:**

- **Fully voiced** - All dialogue recorded
- **Partially voiced** - Key scenes only
- **Grunts/barks only** - No full dialogue
- **Text only** - No voice acting

**If voiced:**

- Number of characters needing voices?
- Approximate dialogue volume?
- Professional or placeholder voices?

Describe your voice acting approach:"

### 4. Generate Production Content

Based on the conversation, prepare the content:

```markdown
## Production Planning

### Writing Scope

**Estimated Word Count:** {{word_count}}

**Content Breakdown:**

- Main story: {{main_story_words}}
- Side content: {{side_content_words}}
- Environmental/lore: {{lore_words}}
- UI/system text: {{ui_words}}

**Scene Count:** {{scene_count}}

**Dialogue Lines:** {{line_count}}

**Branching Complexity:**
{{branching_impact_on_scope}}

---

### Localization

{{if_localizing}}
**Target Languages:**
{{language_list}}

**Cultural Adaptation Notes:**
{{adaptation_needs}}

**Technical Considerations:**

- Text expansion buffer: {{percentage}}
- UI flexibility: {{notes}}
- Audio approach: {{dub_or_subtitle}}
  {{/if_localizing}}

{{if_english_only}}
**Approach:** English only
**Future consideration:** {{maybe_later_notes}}
{{/if_english_only}}

---

### Voice Acting

**Approach:** {{voice_acting_level}}

{{if_voiced}}
**Characters Needing Voices:** {{character_count}}

**Dialogue Volume:** {{line_count_for_recording}}

**Voice Cast Notes:**
{{casting_considerations}}

**Recording Approach:**
{{professional_or_placeholder}}
{{/if_voiced}}

{{if_not_voiced}}
**Rationale:** {{why_no_voice}}
{{/if_not_voiced}}
```

### 5. Present Content and Menu

Show the generated content to the user and present:

"I've documented the production planning.

**Here's what I'll add to the document:**

[Show the complete markdown content from step 4]

**Production Summary:**

- Writing: ~{{word_count}} words
- Localization: {{languages_or_none}}
- Voice acting: {{level}}

**Validation Check:**

- Is scope realistic for your resources?
- Have you considered all production needs?
- Are localization needs addressed?

**Select an Option:**
[A] Advanced Elicitation - Explore production details
[P] Party Mode - Get perspectives on scope
[C] Continue - Save this and move to Completion (Step 11 of 11)"

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
- Update frontmatter: `stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
- Load `./step-11-complete.md`

## CRITICAL STEP COMPLETION NOTE

ONLY WHEN [C continue option] is selected and [production content saved with frontmatter updated], will you then load and read fully `./step-11-complete.md`.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Writing scope estimated
- Localization needs addressed
- Voice acting approach defined
- Realistic production expectations set
- A/P/C menu presented and handled correctly
- Frontmatter updated with stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

### SYSTEM FAILURE:

- Estimating scope without user input
- Missing major production considerations
- Unrealistic expectations set
- Not presenting A/P/C menu after content
- Proceeding without user selecting 'C'

## STEP EXIT (CHK-STEP-10-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-10-EXIT PASSED — completed Step 10: Production Planning
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-11-complete.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

**Next:** Read FULLY and apply: `./step-11-complete.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
