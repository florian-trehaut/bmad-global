---
nextStepFile: './step-05-decision.md'
---

# Step 4: Gather Evidence


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: Gather Evidence with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

For each option, gather concrete evidence: codebase analysis, web research, PoC references, documentation, benchmarks, team experience. Every pro and con must have a source. This step structurally prevents the Retroactive Fiction anti-pattern.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are an evidence gatherer — help the user build a factual case for each option
- Evidence must be concrete and verifiable: URLs, file:line, benchmarks, PoC output
- "We believe" or "in our experience" is NOT evidence unless accompanied by specific references

### Step-Specific Rules:

- Every pro/con must have a verifiable source — no unsourced claims
- Evidence depth must be comparable across ALL options (not just the preferred one)
- Fairy Tale check per option: preferred option must have genuine cons
- Present C/E/Q menu — user must confirm evidence before proceeding

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Process options one by one
- Save WIP before presenting menu

---

## MANDATORY SEQUENCE

### 1. Evidence Gathering Loop

For EACH option in `OPTIONS`:

#### A. Codebase Analysis

If the option relates to existing code or patterns:
- Grep for relevant patterns, dependencies, usage
- Check dependency manifests (package.json, go.mod, Cargo.toml, etc.) for related libraries
- Look for existing implementations of similar patterns
- Result: concrete file:line references

#### B. Web Research

For technology-related options:
- Search for current benchmarks, comparisons, known issues
- Check official documentation for capability verification
- Look for recent community experience (blog posts, official docs, known limitations)
- Verify current stable/LTS versions
- Result: URLs with context

#### C. User Evidence

Ask the user for each option:
"Do you have specific evidence for or against **{option_name}**? Examples: benchmarks, PoC results, team experience with specific projects, vendor evaluations, relevant incidents."

WAIT for input per option.

#### D. Compile Pros & Cons

For each option, list pros and cons. Each MUST have an evidence source:

```markdown
**{Option Name}:**

Pros:
- {statement} — Source: {codebase: file:line | URL | PoC output | user: specific reference}

Cons:
- {statement} — Source: {same}
```

#### E. Fairy Tale Check (per option)

For the user's preferred/leaning option:
- Does it have at least 1 genuine con (not "minor learning curve" or similar dismissals)?
- Do rejected options have at least 1 genuine pro?

If imbalanced: "The evidence for **{option}** shows {N} pros and 0 genuine cons. Every option has trade-offs — what are the real downsides of this approach?"

WAIT for input.

### 2. Evidence Quality Assessment

Present a summary table:

> **Evidence Summary:**
>
> | Option | Pros | Cons | Sources | Quality |
> |--------|------|------|---------|---------|
> | {name} | {N} | {N} | {N} | {HIGH/MEDIUM/LOW} |
> | ... | ... | ... | ... | ... |
>
> **Evidence quality legend:**
> - **HIGH**: concrete measurements, PoC results, verified documentation
> - **MEDIUM**: documentation references, comparable project experience with specifics
> - **LOW**: general knowledge, opinions, unverified claims

<check if="any option has LOW quality">
  "Option **{name}** has low-quality evidence. Consider:
  - Running a quick PoC or benchmark
  - Searching for documented comparisons
  - Asking a team member with specific experience

  Proceed with low-quality evidence? This may weaken the ADR."
</check>

### 3. Driver Mapping

Map evidence to decision drivers for each option:

> **How each option addresses the decision drivers:**
>
> | Driver | {Option 1} | {Option 2} | {Do Nothing} |
> |--------|------------|------------|--------------|
> | {driver 1} | {assessment + evidence ref} | ... | ... |
> | {driver 2} | ... | ... | ... |

### 4. Update WIP

Store evidence per option: `{pros[], cons[], sources[], quality, driver_mapping}`. Update `stepsCompleted: [1, 2, 3, 4]`.

### 5. Present Menu

> **[C]** Continue to decision formulation (Step 5)
> **[E]** Edit — add evidence, modify pros/cons
> **[Q]** Questions about evidence or methodology

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **E**: Ask what to modify. Apply changes. Re-present evidence summary. Redisplay menu.
- **Q**: Answer questions. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Every option has evidence-backed pros AND cons
- No option has zero cons (Fairy Tale prevention)
- Evidence quality assessed per option
- Evidence depth comparable across all options
- Driver mapping complete
- Sources are concrete and verifiable

### FAILURE:

- Pros/cons without sources
- Accepting "we believe" as evidence
- Unequal evidence depth (deep analysis for preferred option, shallow for others)
- Not challenging a preferred option that has zero cons
- Skipping web research or codebase analysis

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Gather Evidence
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
