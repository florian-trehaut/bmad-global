---
nextStepFile: './step-05-nfr-scan.md'
---

# Step 4: Proactive Alternative Research

## STEP GOAL:

Research alternatives the ADR author may not have considered. Explore at least one unconsidered option, or justify why no additional alternatives are relevant.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a constructive researcher — suggest credible alternatives, not strawmen
- An alternative must be genuinely relevant to the problem context
- "No additional relevant alternative" is a valid outcome if justified

### Step-Specific Rules:

- Do NOT simply list technologies — evaluate relevance to the specific problem
- Each alternative must have brief pros/cons compared to the chosen option
- Use web search for current best practices — do not rely solely on training data
- Codebase patterns in `{WORKTREE_PATH}` may suggest alternatives

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu

---

## MANDATORY SEQUENCE

### 1. Identify Research Scope

From the parsed ADR sections, extract:
- Problem statement (from `context`)
- Decision drivers (from `decision_drivers` or inferred)
- Options already considered (from `options`)
- Chosen option (from `decision`)

### 2. Research Alternatives

Three research vectors:

#### Vector A: Web Search

Search for current best practices related to the ADR's problem domain:

```
{problem_domain} best practices {current_year}
{problem_domain} alternatives to {chosen_option}
{problem_domain} comparison {technology_area}
```

Look for options the author may not have considered due to recency or domain breadth.

#### Vector B: Codebase Patterns

Search `{WORKTREE_PATH}` for existing patterns that address the same problem differently:

```bash
# Look for existing solutions to the same problem
grep -r "{problem_keywords}" {WORKTREE_PATH} --include="*.{ext}"
# Check for existing ADRs or architectural patterns
find {WORKTREE_PATH} -name "*.md" -path "*/adr/*" -o -name "*.md" -path "*/decisions/*"
```

#### Vector C: Problem Reframing

Consider whether the problem itself can be reframed:
- Can the problem be avoided entirely (different architecture)?
- Can it be deferred (is the decision premature)?
- Can the scope be reduced (solve a smaller problem first)?

### 3. Evaluate Alternatives

For each credible alternative found:

| Field | Content |
|-------|---------|
| Name | Alternative name |
| Source | Where found (web search, codebase, reframing) |
| Relevance | HIGH / MEDIUM / LOW to the specific problem |
| Pros vs. Chosen | What this alternative does better |
| Cons vs. Chosen | What the chosen option does better |
| Why Author May Have Missed | Recency, domain breadth, framing bias |

Filter: only include alternatives with MEDIUM or HIGH relevance.

### 4. Generate Findings

<check if="credible alternatives found">
  For each HIGH-relevance alternative, generate an ALTERNATIVES finding:
  - Severity: MAJOR if the alternative is clearly superior on stated decision drivers
  - Severity: MINOR if the alternative is comparable but worth mentioning
</check>

<check if="no credible alternatives found">
  Document: "No additional relevant alternatives identified."
  Justification: {why — e.g., "The ADR already covers the major options in this space, including status quo."}
  No finding generated — this is a valid outcome.
</check>

### 5. Present Results

> **Alternative Research Results**
>
> **Research vectors explored:**
> - Web search: {queries_run}
> - Codebase patterns: {patterns_found}
> - Problem reframing: {reframing_considered}
>
> {If alternatives found:}
> | # | Alternative | Relevance | Key Advantage | Key Disadvantage |
> |---|------------|-----------|---------------|-----------------|
> | 1 | {name} | {relevance} | {pro vs chosen} | {con vs chosen} |
>
> {If no alternatives:}
> No additional relevant alternatives identified. {justification}

### 6. Update WIP

Add step 4 to `stepsCompleted`. Store alternative research results.

### 7. Present Menu

> **[C]** Continue to NFR scan (Step 5)

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All three research vectors explored
- Alternatives evaluated with pros/cons vs. chosen option
- "No additional alternatives" is justified, not lazy
- Results presented before proceeding

### FAILURE:

- Listing technologies without evaluating relevance
- Not using web search (relying solely on LLM knowledge)
- Skipping codebase pattern search
- Presenting irrelevant alternatives to inflate findings count
