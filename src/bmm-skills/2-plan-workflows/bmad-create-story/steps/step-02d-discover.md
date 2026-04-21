---
advancedElicitationTask: '~/.claude/skills/bmad-advanced-elicitation/SKILL.md'
partyModeWorkflow: '~/.claude/skills/bmad-party-mode/workflow.md'
businessContextTemplate: '~/.claude/skills/bmad-shared/data/business-context-template.md'
---

# Step 2d: Conversational Discovery (Discovery Mode Only)

## STEP GOAL

Scan the codebase and tracker for context, ask informed questions, capture scope, then capture the full business context (user journey, BACs, validation metier, DoD) — all BEFORE diving into technical investigation.

## RULES

- You are a Spec Engineering Facilitator — collaborative dialogue
- You bring code awareness and structured product thinking; user brings domain expertise
- Focus on scoping and business outcomes — NOT technical implementation
- FORBIDDEN: generic questions like "What's the scope?" — scan code first, ask grounded questions
- FORBIDDEN: proposing technical solutions or architecture (that's Steps 4-5)
- FORBIDDEN: skipping business context because "it's just a small bug" — even bugs have business impact
- Adapt question depth to {USER_SKILL_LEVEL}

## SEQUENCE

### PART A — Orient & Scope

#### A1. Quick Context Scan

**Launch parallel searches where subprocess is available:**

**IF `{TRACKER}` == `file` (file-based tracker):**

- Read `{project-root}/{TRACKER_EPICS_FILE}` — scan epic titles and descriptions for relevance
- Scan `{project-root}/{TRACKER_STORY_LOCATION}/` — list existing story files, grep for keywords
- Note matching epics as `RELATED_EPIC` and overlapping stories as `RELATED_STORIES`

**ELSE (MCP-based tracker):**

- Check tracker for related issues: List issues for team {TRACKER_TEAM}, query: {keywords}, limit: 5
- Check for related epics/projects: List epics/projects for team {TRACKER_TEAM}

**BOTH:**

- Skim project context for relevant patterns
- **Search for prior closed/rejected PRs/MRs** — surfaces prior attempts and reviewer objections:
  ```bash
  {FORGE_CLI} mr list --state closed --search "{keywords}" 2>/dev/null || true
  {FORGE_CLI} pr list --state closed --search "{keywords}" 2>/dev/null || true
  ```
  If prior PRs found, note the approach taken and why it was rejected/closed.

If user mentioned specific code/features, do a quick scan **inside {SPEC_WORKTREE_PATH} or project root** (read-only):

- Search for relevant files/classes/functions using grep subprocess
- Note tech stack, obvious patterns, file locations
- DON'T deep-dive — that's Step 4

#### A2. Ask Informed Questions

Ask questions grounded in what you found. Make them specific, not generic.

Instead of "What's the scope?", ask things like:

- "`AuthService` handles validation in the controller — should the fix follow that pattern or move it?"
- "I see there's already an issue {ISSUE_PREFIX}-XX about Y — is this related or separate?"
- "The current implementation uses X pattern — should we stick with it?"

#### A3. Capture Core Understanding

From the conversation, capture:

- **Title**: Clear, concise name
- **Slug**: URL-safe version (lowercase, hyphens)
- **Type**: bug | task | feature | improvement
- **Problem Statement**: What problem are we solving?
- **Solution**: High-level approach (1-2 sentences)
- **In Scope**: What's included
- **Out of Scope**: What's explicitly NOT included

Present as a narrative summary first, then the structured list. Ask user to confirm.

### PART B — Business Context

#### B1. Frame the Business Perspective

Start by reframing from a business/product angle:

> We defined the technical scope. Now let's think from the end user's perspective.
>
> **Who is impacted?** And **what must they be able to do once it's in production?**

Help the user think beyond code:

- **Feature**: what's the complete user journey from trigger to outcome?
- **Bug fix**: what's broken today, and what should it be after the fix?
- **Integration**: what does the end-to-end flow look like from business perspective?

WAIT for user input.

#### B2. Document User Journey E2E

```markdown
### User Journey E2E

**Primary actor:** {beneficiary / client / admin / system}

1. {Step 1 from user's perspective}
2. {Step 2 ...}
...
N. {Expected final outcome}
```

Each step describes what the **user sees or does**, not what the code does. Present and confirm.

#### B3. Define Business Acceptance Criteria

> Let's define what we must observe from the user/business perspective once in production.

Format: Given/When/Then from user perspective:

```markdown
### Business Acceptance Criteria

- [ ] BAC-1: Given {user context}, when {user action}, then {observable result}
- [ ] BAC-2: Given {context}, when {action}, then {result}
```

Cover: happy path, error experience, edge cases. CRITICAL: BACs must be verifiable by a human in production.

#### B4. Identify External Dependencies & Validation Gates

Proactively ask:

> Does this feature depend on an external actor? Provider, legal, compliance, third-party system, partner config?

If external dependencies exist:

```markdown
### External Dependencies & Validation Gates

| Dependency | Owner | Required Action | Gate (blocking?) | Status |
| ---------- | ----- | --------------- | ---------------- | ------ |
```

If none: document "No external dependencies identified."

#### B5. Define Validation Metier Checklist

Load {businessContextTemplate} for structured output format and VM quality guidelines.

> When this story is deployed, what tests must be performed to confirm it works from the business perspective?

```markdown
### Validation Metier (production tests)

- [ ] VM-1 [type] *(BAC-1,2)* : {concrete business test, executable}
- [ ] VM-2 [type] *(BAC-3)* : {concrete business test}
```

Each VM must trace to BACs. Declare a type in brackets — adapt types to the project's stack (see `validation.md` if loaded):

| Type | When to use |
|------|------------|
| `[api]` | Verify API endpoint response |
| `[db]` | Verify database state |
| `[e2e]` | Multi-step browser workflow |
| `[component]` | Single UI component behavior |
| `[visual]` | Visual appearance at one viewport |
| `[responsive]` | Multi-viewport layout |
| `[accessibility]` | Keyboard nav, screen reader, contrast |
| `[error-handling]` | Error states, empty states, loading |
| `[performance]` | Page load, Core Web Vitals |
| `[cloud_log]` | Background processing, async events |
| `[state]` | Browser storage persistence |

#### B6. Identify Out-of-Control Factors

> Are there elements outside our control that could impact the result?

If any: document with owner and escalation trigger. If none: skip.

#### B7. Product-Level Definition of Done

Synthesize into DoD with TWO dimensions:

```markdown
### Definition of Done (product)

This story is "Done" when:

**Feature:**
1. {business criterion 1}
2. {business criterion 2}
3. All Validation Metier tests (feature) have passed

**Non-regression:**
4. Flows impacted by our changes continue to work (non-regression VMs passed)
5. {if applicable: external confirmation obtained}
```

The non-regression section is a placeholder here — it will be enriched in Step 6 (Impact Analysis) with concrete VMs.

Present the full business context. WAIT for user feedback. Address corrections.

### PART C — Menu

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to worktree setup (Step 3)"

#### Menu Handling Logic:

- IF A: Read fully and follow {advancedElicitationTask} with current context, process insights, ask "Accept improvements? (y/n)", if yes update then redisplay menu
- IF P: Read fully and follow {partyModeWorkflow} with current context, process insights, ask "Accept changes? (y/n)", if yes update then redisplay menu
- IF C: Load, read fully, and execute `./step-03-setup-worktree.md`
- IF any other: Respond helpfully then redisplay menu

ALWAYS halt and wait for user input after presenting menu. ONLY proceed when user selects 'C'.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Quick scan performed (tracker + code), informed questions asked
- Core understanding captured and confirmed by user
- User journey E2E documented from user perspective
- Business ACs defined in Given/When/Then (observable by human)
- External dependencies documented (or "none" confirmed)
- Validation Metier checklist defined with VM types and BAC tracing
- Product-level DoD synthesized
- User confirmed business context
- Menu presented and handled

### FAILURE:

- Generic questions without scanning first
- Deep-diving into code (too early)
- Writing technical ACs instead of business ACs
- VM items that are technical (e.g., "check logs") instead of business
- Not asking about external dependencies
- Proceeding without user confirmation
