---
nextStepFile: './step-04-alternatives.md'
---

# Step 3: Evaluate Reasoning Quality

## STEP GOAL:

Evaluate the ADR's decision reasoning using 6 challenge axes and detect anti-patterns. Generate REASONING, ALTERNATIVES, and CONSEQUENCES findings.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are an impartial evaluator — not adversarial, not lenient
- Acknowledge genuine strengths alongside weaknesses
- Anti-pattern detection is evidence-based, not opinion-based

### Step-Specific Rules:

- Load data files before evaluation — do not work from memory
- Each challenge axis must produce at least one observation (finding or "no issues found")
- Anti-pattern detection uses heuristics from `data/anti-patterns.md`, not gut feeling

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Loop menu until user selects 'C'

---

## MANDATORY SEQUENCE

### 1. Load Evaluation Data

Read these data files:
- `./data/review-criteria.md` — evaluation categories and finding schema
- `./data/anti-patterns.md` — anti-pattern detection heuristics

### 2. Apply 6 Challenge Axes

Evaluate the ADR against each axis. These are borrowed from bmad-spike step-05-review and adapted for external ADR review:

#### Axis 1: Evidence Sufficiency

- Does each pro/con reference a concrete evidence source?
- Are evidence sources verifiable (URLs, file paths, test results)?
- Is the evidence current (not outdated references)?
- Are performance/scalability claims backed by measurements?

#### Axis 2: Missing Options

- Were at least 2 options seriously considered?
- Is "do nothing" / status quo evaluated?
- Are options evaluated with equal depth?
- Are there obvious alternatives not mentioned?

#### Axis 3: Logic Chain

- Does the decision follow from the stated drivers and evidence?
- Is the justification specific (not generic "best option")?
- Are rejected options dismissed with evidence (not hand-waving)?
- Does the reasoning contain logical fallacies?

#### Axis 4: Risk Assessment

- Are risks identified with specific mitigations?
- Are negative consequences honest and specific?
- Are operational/maintenance consequences addressed?
- Are mitigations actionable (not "we'll handle it later")?

#### Axis 5: Confirmation Bias

- Did the investigation favor a pre-existing preference?
- Is evidence presented selectively (only supporting chosen option)?
- Are rejected options evaluated fairly or strawmanned?
- Does the ADR acknowledge uncertainty?

#### Axis 6: Consequences Completeness

- Are both positive AND negative consequences listed?
- Are consequences specific (not vague platitudes)?
- Do consequences cover: immediate, medium-term, long-term?
- Are cross-team and organizational impacts addressed?

For each axis, record: observation, finding (if applicable), or "no issues found."

### 3. Run Anti-Pattern Detection

Apply detection heuristics from `data/anti-patterns.md`:

For each anti-pattern (Fairy Tale, Sprint, Tunnel Vision, Retroactive Fiction):
1. Apply each detection heuristic
2. Count matching heuristics
3. If ≥2 heuristics match → flag the anti-pattern
4. Generate finding with appropriate severity

Check combined detection rules (e.g., Fairy Tale + Sprint = BLOCKER).

Store anti-pattern detection results for the report.

### 4. Generate Findings

For each issue found across the 6 axes and anti-pattern detection, create a finding per the schema in `data/review-criteria.md`. Use categories: REASONING, ALTERNATIVES, CONSEQUENCES.

### 5. Present Evaluation Results

> **Reasoning Evaluation — 6 Challenge Axes**
>
> | Axis | Status | Key Observation |
> |------|--------|----------------|
> | Evidence Sufficiency | {PASS/CONCERN/FAIL} | {brief} |
> | Missing Options | {PASS/CONCERN/FAIL} | {brief} |
> | Logic Chain | {PASS/CONCERN/FAIL} | {brief} |
> | Risk Assessment | {PASS/CONCERN/FAIL} | {brief} |
> | Confirmation Bias | {PASS/CONCERN/FAIL} | {brief} |
> | Consequences Completeness | {PASS/CONCERN/FAIL} | {brief} |
>
> **Anti-Pattern Detection:**
>
> | Anti-pattern | Detected | Heuristics Matched |
> |--------------|----------|-------------------|
> | Fairy Tale | {YES/NO} | {N}/{total} |
> | Sprint | {YES/NO} | {N}/{total} |
> | Tunnel Vision | {YES/NO} | {N}/{total} |
> | Retroactive Fiction | {YES/NO} | {N}/{total} |
>
> **Findings generated:** {N} ({by severity})

### 6. Update WIP

Add step 3 to `stepsCompleted`. Store evaluation results and findings.

### 7. Present Menu

> **[C]** Continue to alternative research (Step 4)
> **[Q]** Questions — ask about evaluation methodology or specific findings

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **Q**: Answer questions. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All 6 challenge axes evaluated with observations
- Anti-pattern detection applied with heuristic counts
- Findings generated with evidence, not opinion
- Results presented before proceeding

### FAILURE:

- Skipping challenge axes
- Detecting anti-patterns without applying heuristics
- Generating findings based on "feeling" without evidence
- Being adversarial instead of impartial
