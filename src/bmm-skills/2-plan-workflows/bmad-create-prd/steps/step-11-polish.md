# Step 11: Document Polish

## STEP GOAL

Optimize the complete PRD document for flow, coherence, and professional presentation while preserving all essential information. Load the PRD purpose document first to understand quality standards, then apply targeted improvements.

## RULES

- Load the ENTIRE document before making changes
- PRESERVE user's voice and intent -- optimize presentation, not content
- Maintain all essential information while reducing duplication
- Ensure proper ## Level 2 headers throughout
- ONLY save when user chooses C (Continue)

## SEQUENCE

### 1. Load Context and Document

**Load the PRD purpose document first:**

- Read `../data/prd-purpose.md` to understand what makes a great BMAD PRD
- Internalize the philosophy: information density, traceability, measurable requirements
- Keep the dual-audience nature (humans + LLMs) in mind

**Then Load the PRD Document:**

- Read `{outputFile}` completely from start to finish
- Understand the full document structure and content
- Identify all sections and their relationships
- Note areas that need attention

### 2. Document Quality Review

Review the entire document with PRD purpose principles in mind:

**Information Density:**

- Are there wordy phrases that can be condensed?
- Is conversational padding present?
- Can sentences be more direct and concise?

**Flow and Coherence:**

- Do sections transition smoothly?
- Are there jarring topic shifts?
- Does the document tell a cohesive story?
- Is the progression logical for readers?

**Duplication Detection:**

- Are ideas repeated across sections?
- Is the same information stated multiple times?
- Can redundant content be consolidated?
- Are there contradictory statements?

**Header Structure:**

- Are all main sections using ## Level 2 headers?
- Is the hierarchy consistent (##, ###, ####)?
- Can sections be easily extracted or referenced?
- Are headers descriptive and clear?

**Readability:**

- Are sentences clear and concise?
- Is the language consistent throughout?
- Are technical terms used appropriately?
- Would stakeholders find this easy to understand?

### 2b. Brainstorming Reconciliation (if brainstorming input exists)

**Check the PRD frontmatter `inputDocuments` for any brainstorming document** (e.g., `brainstorming-session*.md`, `brainstorming-report.md`). If a brainstorming document was used as input:

1. **Load the brainstorming document** and extract all distinct ideas, themes, and recommendations
2. **Cross-reference against the PRD** -- for each brainstorming idea, check if it landed in any PRD section (requirements, success criteria, user journeys, scope, etc.)
3. **Identify dropped ideas** -- ideas from brainstorming that do not appear anywhere in the PRD. Pay special attention to:
   - Tone, personality, and interaction design ideas (these are most commonly lost)
   - Design philosophy and coaching approach ideas
   - "What should this feel like" ideas (UX feel, not just UX function)
   - Qualitative/soft ideas that don't map cleanly to functional requirements
4. **Present findings to user**: "These brainstorming ideas did not make it into the PRD: [list]. Should any be incorporated?"
5. **If user wants to incorporate dropped ideas**: Add them to the most appropriate PRD section (success criteria, non-functional requirements, or a new section if needed)

**Why this matters**: Brainstorming documents are often long, and the PRD's structured template has an implicit bias toward concrete/structural ideas. Soft ideas (tone, philosophy, interaction feel) frequently get silently dropped because they don't map cleanly to FR/NFR format.

### 3. Optimization Actions

Make targeted improvements:

**Improve Flow:**

- Add transition sentences between sections
- Smooth out jarring topic shifts
- Ensure logical progression
- Connect related concepts across sections

**Reduce Duplication:**

- Consolidate repeated information
- Keep content in the most appropriate section
- Use cross-references instead of repetition
- Remove redundant explanations

**Enhance Coherence:**

- Ensure consistent terminology throughout
- Align all sections with product differentiator
- Maintain consistent voice and tone
- Verify scope consistency across sections

**Optimize Headers:**

- Ensure all main sections use ## Level 2
- Make headers descriptive and action-oriented
- Check that headers follow consistent patterns
- Verify headers support document navigation

### 4. Preserve Critical Information

**While optimizing, ensure NOTHING essential is lost:**

**Must Preserve:**

- All user success criteria
- All functional requirements (capability contract)
- All user journey narratives
- All scope decisions (whether phased or single-release), including consent-critical evidence (explicit user confirmations and rationales for any scope changes from step 8)
- All non-functional requirements
- Product differentiator and vision
- Domain-specific requirements
- Innovation analysis (if present)

**Can Consolidate:**

- Repeated explanations of the same concept
- Redundant background information
- Multiple versions of similar content
- Overlapping examples

### 5. Generate Optimized Document

Create the polished version:

1. Start with original document
2. Apply all optimization actions
3. Review to ensure nothing essential was lost
4. Verify improvements enhance readability
5. Prepare optimized version for review

### 6. Present MENU OPTIONS

Present the polished document for review, then display menu:

- Show what changed in the polish
- Highlight improvements made (flow, duplication, headers)
- Ask if they'd like to refine further, get other perspectives, or proceed

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Complete PRD"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the polished document, process the enhanced refinements that come back, ask user "Accept these polish improvements? (y/n)", if yes update content with improvements then redisplay menu, if no keep original polish then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the polished document, process the collaborative refinements to flow and coherence, ask user "Accept these polish changes? (y/n)", if yes update content with improvements then redisplay menu, if no keep original polish then redisplay menu
- IF C: Save the polished document to {outputFile}, update frontmatter by adding this step name to the end of the stepsCompleted array, then read fully and follow: ./step-12-complete.md
- IF Any other: help user respond, then redisplay menu

## APPEND TO DOCUMENT

When user selects 'C', replace the entire document content with the polished version.
