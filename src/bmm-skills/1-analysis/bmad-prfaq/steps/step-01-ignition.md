---
nextStepFile: './step-02-press-release.md'
---

# Step 1: Ignition

## STEP GOAL

Get the raw concept on the table and immediately establish customer-first thinking. Detect operating mode (interactive vs headless), capture the four essentials (customer, problem, stakes, solution concept), identify concept type, gather contextual intelligence from artifacts and web research, and create the working output document. This step ends when you have enough clarity to draft a press release headline.

## RULES

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread
- Focus on understanding the concept at a high level -- no drafting yet
- Customer-first enforcement is non-negotiable: solutions and technologies must be redirected to problems
- When the user is stuck, draft a hypothesis for them to react to rather than repeating the question harder

## SEQUENCE

### 1. Mode Detection

Check if `--headless` / `-H` was provided in the activation arguments.

**If headless mode:**
- Validate the input schema -- the following are required and must not be vague:
  - **customer** (specific persona, not "everyone")
  - **problem** (concrete and felt, not abstract)
  - **stakes** (why it matters, consequences)
  - **solution concept** (even rough)
- Optional inputs: competitive context, technical constraints, team/org context, target market, existing research
- If required fields are missing or too vague, HALT with specific guidance on what is needed
- If valid, acknowledge the inputs, proceed directly to contextual gathering (section 5), then auto-advance through all steps without interaction

**If interactive mode (default):** Continue with the full coaching gauntlet below.

### 2. Greet and Set the Tone

Greet `{USER_NAME}` in `{COMMUNICATION_LANGUAGE}`. Be warm but efficient -- dream builder energy.

**Set the tone immediately.** This is not a warm, exploratory greeting. Frame it as a challenge -- the user is about to stress-test their thinking by writing the press release for a finished product before building anything. Convey that surviving this process means the concept is ready, and failing here saves wasted effort. Be direct and energizing.

Briefly ground the user on what a PRFAQ actually is -- Amazon's Working Backwards method where you write the finished-product press release first, then answer the hardest customer and stakeholder questions. The point is forcing clarity before committing resources.

### 3. WIP Resume Check

Derive a URL-safe slug from the concept (lowercase, hyphens).

Check if `/tmp/bmad-wip-prfaq-{slug}.md` exists.

**If WIP file found:**

Read the WIP file frontmatter -- extract `title`, `slug`, `stepsCompleted`, `status`.

Present to user:

> I found a draft in progress for this topic:
>
> **{title}** (slug: `{slug}`)
> - Steps completed: {stepsCompleted}
> - Status: {status}
>
> **[Y]** Resume where we left off
> **[N]** Start fresh (delete old WIP)

WAIT for user selection.

- **IF Y:** Load WIP state and jump to the next incomplete step
- **IF N:** Delete the WIP file, then continue below

**If no WIP file:** Continue below.

### 4. Customer-First Concept Capture

**Customer-first enforcement:**

- If the user leads with a solution ("I want to build X"): redirect to the customer's problem. Do not let them skip the pain.
- If the user leads with a technology ("I want to use AI/blockchain/etc"): challenge harder. Technology is a "how", not a "why" -- push them to articulate the human problem. Strip away the buzzword and ask whether anyone still cares.
- If the user leads with a customer problem: dig deeper into specifics -- how they cope today, what they have tried, why it has not been solved.

When the user gets stuck, offer concrete suggestions based on what they have shared so far. Draft a hypothesis for them to react to rather than repeating the question harder.

**Concept type detection:** Early in the conversation, identify whether this is a commercial product, internal tool, open-source project, or community/nonprofit initiative. Store this as `{concept_type}` -- it calibrates FAQ question generation in Steps 3 and 4. Non-commercial concepts do not have "unit economics" or "first 100 customers" -- adapt the framing to stakeholder value, adoption paths, and sustainability instead.

**Essentials to capture before progressing:**
- Who is the customer/user? (specific persona, not "everyone")
- What is their problem? (concrete and felt, not abstract)
- Why does this matter to them? (stakes and consequences)
- What is the initial concept for a solution? (even rough)

**Fast-track:** If the user provides all four essentials in their opening message (or via structured input), acknowledge and confirm understanding, then move directly to contextual gathering and document creation without extended discovery.

**Graceful redirect:** If after 2-3 exchanges the user cannot articulate a customer or problem, do not force it -- suggest the idea may need more exploration first and recommend they invoke the `bmad-brainstorming` skill to develop it further.

### 5. Contextual Gathering

Once you understand the concept, gather external context before drafting begins.

1. **Ask about inputs:** Ask the user whether they have existing documents, research, brainstorming, or other materials to inform the PRFAQ. Collect paths for subagent scanning -- do not read user-provided files yourself; that is the Artifact Analyzer's job.
2. **Fan out subagents in parallel:**
   - **Artifact Analyzer** (`./agents/artifact-analyzer.md`) -- Scans `{planning_artifacts}` and `{project_knowledge}` for relevant documents, plus any user-provided paths. Receives the product intent summary so it knows what is relevant.
   - **Web Researcher** (`./agents/web-researcher.md`) -- Searches for competitive landscape, market context, and current industry data relevant to the concept. Receives the product intent summary.
3. **Graceful degradation:** If subagents are unavailable, scan the most relevant 1-2 documents inline and do targeted web searches directly. Never block the workflow.
4. **Merge findings** with what the user shared. Surface anything surprising that enriches or challenges their assumptions before proceeding.

### 6. Create Output Document

Create the output document at `{planning_artifacts}/prfaq-{PROJECT_NAME}.md` using `./templates/prfaq.md`. Write the frontmatter (populate `inputs` with any source documents used) and any initial content captured during Ignition. This document is the working artifact -- update it progressively through all steps.

### 7. Coaching Notes Capture

Append a `<!-- coaching-notes-stage-1 -->` block to the output document:
- Concept type and rationale
- Initial assumptions challenged
- Why this direction over alternatives discussed
- Key subagent findings that shaped the concept framing
- Any user context captured that does not fit the PRFAQ itself

### 8. Save WIP File

Write `/tmp/bmad-wip-prfaq-{slug}.md` with frontmatter:
- `title`, `slug`, `created: {date}`, `status: in-progress`
- `stepsCompleted: [1]`
- `concept_type: {concept_type}`
- `output_file: {planning_artifacts}/prfaq-{PROJECT_NAME}.md`

### 9. CHECKPOINT

When you have enough clarity to draft a press release headline, confirm readiness with the user before proceeding.

> The concept is on the table. Ready to enter the forge and draft the press release?
>
> **[C]** Continue to Press Release drafting
> **[R]** Revisit -- I want to refine the concept further

WAIT for user selection.

- **IF C:** Proceed to next step
- **IF R:** Loop back to section 4 for further refinement

---

**Next:** Read fully and follow `{nextStepFile}`.
