---
nextStepFile: './step-04-evidence.md'
---

# Step 3: Discover & Document Options

## STEP GOAL:

Identify at least 3 options (including "do nothing" / status quo). Each option gets equal initial documentation. This step structurally prevents the Sprint anti-pattern.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You help discover options the user might not have considered
- Ensure fairness — all options described with comparable depth
- The user may have a preferred option — that is fine, but it must be evaluated alongside real alternatives

### Step-Specific Rules:

- **MINIMUM 3 OPTIONS MANDATORY** (including "do nothing" / status quo)
- Sprint anti-pattern guard: if user only wants to document 1 option, explain why and insist on alternatives
- All options must be described with comparable depth — no one-liners alongside paragraphs
- Present C/E/A/P menu — user must confirm options before proceeding

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP before presenting menu
- Present menu — user must confirm with C

---

## MANDATORY SEQUENCE

### 1. Collect User's Known Options

"What options have you considered? List them, including any you've already leaned toward."

WAIT for user input.

### 2. Add "Do Nothing" / Status Quo

If not already listed by the user, explicitly add:

> **Do Nothing (Status Quo):** What happens if we don't act? What is the current state and its trajectory?

Ask the user to describe the consequences of inaction. This is mandatory unless the user explains why inaction is literally impossible (e.g., "the current system is down and cannot be restored").

### 3. Proactive Option Research

Three research vectors to discover options the user may not have considered:

**Vector A: Web Search** — Search for current alternatives:
```
"{decision_topic} alternatives {current_year}"
"{decision_topic} vs {known_option} comparison"
```

**Vector B: Codebase Patterns** — Check how similar problems are solved elsewhere in the codebase. Grep for existing patterns that address the same concern differently.

**Vector C: Problem Reframing** — Consider:
- Can the problem be avoided entirely? (different approach)
- Can it be deferred? (temporary solution + revisit later)
- Can the scope be reduced? (simpler version of the same need)

Present discovered options to user: "I found these additional alternatives worth considering: {list}. Which should we include?"

WAIT for input.

### 4. Sprint Anti-Pattern Guard

Verify the options list:

<check if="fewer than 3 options (including do-nothing)">
  "An ADR with only {N} option(s) matches the **Sprint anti-pattern** — it reads as a post-hoc justification rather than a genuine decision record. A well-formed ADR needs at least 3 options evaluated with comparable rigor.

  Can we identify at least one more alternative? If not, explain why no other option exists."

  WAIT for input.

  If user provides additional options: add them.
  If user insists on fewer with valid justification: accept but flag:
  "Noted — the ADR will proceed with {N} options. This may be flagged during review."
</check>

### 5. Document Each Option

For each option, capture with comparable depth:

- **Name** — concise, descriptive
- **Description** — 1-3 sentences: what this option entails (architecture, technology, approach)
- **Initial signals** — user's preliminary sense (optional — will be validated by evidence in step-04)

**Depth parity check:** Verify all options have similar description length. If one option has 3 sentences and another has 1, prompt the user to expand the shorter descriptions.

### 6. Present Options Summary

> **Options identified ({N}):**
>
> **1. {name}**
> {description}
>
> **2. {name}**
> {description}
>
> **3. Do Nothing (Status Quo)**
> {description}
>
> {If more options...}

### 7. Update WIP

Store `OPTIONS` list. Update `stepsCompleted: [1, 2, 3]`.

### 8. Present Menu

> **[C]** Continue to evidence gathering (Step 4)
> **[E]** Edit — add, remove, or modify options
> **[A]** Advanced Elicitation — deeper exploration of the option space
> **[P]** Party Mode — multiple perspectives on option completeness
> **[Q]** Questions

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **E**: Ask what to modify. Apply changes. Re-present options. Redisplay menu.
- **A**: Invoke `skill:bmad-advanced-elicitation` with options context. Process insights. Ask user to accept/reject additions. Redisplay menu.
- **P**: Invoke `skill:bmad-party-mode` with options context. Process perspectives. Ask user to accept/reject. Redisplay menu.
- **Q**: Answer questions. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Minimum 3 options documented (including do-nothing)
- All options described with comparable depth
- Proactive research performed (web + codebase + reframing)
- Sprint anti-pattern guard applied
- User confirmed options via C selection

### FAILURE:

- Allowing only 1-2 options without challenge
- Not including "do nothing" / status quo
- Options described with wildly unequal depth
- Skipping proactive research
- Auto-proceeding without user C selection
