---
nextStepFile: './step-05-review.md'
---

# Step 4: Synthesize


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
CHK-STEP-04-ENTRY PASSED — entering Step 4: Synthesize with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Structure raw investigation findings into the chosen deliverable format(s). Produce a recommendation with evidence. Every claim in the deliverable must trace to evidence from Step 3.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You synthesize evidence into structured knowledge — not opinions
- Every statement in the deliverable must be backed by evidence from Step 3
- The recommendation must be actionable — "further investigation needed" alone is never acceptable

### Step-Specific Rules:

- Load and follow the appropriate template(s) from `data/`
- The recommendation MUST include a clear verdict (Go / No-Go / Go-with-caveats)
- Include evidence references (file:line, URLs, PoC output) throughout
- Present synthesis for user validation before proceeding to review

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Present C/E/Q menu — user must confirm synthesis before review

---

## MANDATORY SEQUENCE

### 1. Load Deliverable Template(s)

Based on the output format chosen in Step 2, load the corresponding template(s) from `../data/`:

| Format | Template |
|--------|----------|
| ADR | `../data/adr-template.md` |
| Trade-off Matrix | `../data/tradeoff-template.md` |
| PoC Findings | `../data/poc-findings-template.md` |
| Findings Summary | `../data/findings-template.md` |

If combined formats: load all applicable templates.

### 2. Compile Evidence per KAC

For each KAC, gather all evidence from Step 3:

```markdown
### Evidence Compilation

**KAC-1:** {description}
- Code analysis: {findings with file:line}
- Web research: {findings with URLs}
- PoC results: {execution output, verdict}
- Benchmark data: {methodology, summary stats}
- **Status:** {ANSWERED | PARTIAL | UNANSWERED}
- **Answer:** {direct answer to this KAC}
```

### 3. Structure the Deliverable

Fill the template following its structure. Key rules per format:

**If ADR (MADR format):**
- **Check existing ADRs:** if `PROJECT_ADRS` is loaded (from step-01 prior attempts search or workflow-context), verify whether this ADR supersedes or conflicts with any existing ADR. If it does, explicitly state: "This ADR supersedes ADR-{N}: {title}" in the context section.
- Context describes the problem and forces, not the solution
- At least 2 options considered (including "do nothing" if applicable)
- Each option has evidence-based pros/cons (not speculation)
- Decision outcome traces to specific evidence from the investigation
- Consequences include both positive and negative
- Anti-pattern check: no "Fairy Tale" (only pros), no "Sprint" (single option), no "Tunnel Vision" (ignoring operational consequences)

**If Trade-off Matrix:**
- Separate must-haves (binary pass/fail gates) from weighted criteria
- 5-8 weighted criteria maximum
- Each score backed by evidence (not opinion)
- Include sensitivity analysis: does the winner change if weights shift by ±10%?
- Present both the matrix and a prose explanation of the key trade-offs

**If PoC Findings:**
- Hypothesis stated clearly
- Environment and methodology documented for reproducibility
- Results presented with raw data, not just summaries
- Go/No-Go verdict justified by results against pre-defined criteria
- Limitations and gaps explicitly acknowledged

**If Findings Summary:**
- Each finding has concrete evidence and a confidence level (HIGH/MEDIUM/LOW)
- Unknowns acknowledged with specific resolution proposals
- Investigation scope boundaries documented (what was and was not investigated)

### 4. Formulate Recommendation

MANDATORY section in every deliverable — this is the core output of the spike:

```markdown
## Recommendation

**Verdict:** {GO | NO-GO | GO WITH CAVEATS}

**Answer to spike question:** {direct, concise answer}

**Recommended approach:** {specific, actionable recommendation}

**Evidence supporting this recommendation:**
- {evidence 1 with reference (file:line, URL, PoC output)}
- {evidence 2 with reference}
- {evidence 3 with reference}

**Risks of this approach:**
- {risk 1 — impact and mitigation}
- {risk 2 — impact and mitigation}

**Alternatives considered and rejected:**
- {option — reason for rejection with evidence}

**Caveats / conditions (if GO WITH CAVEATS):**
- {condition 1 — must be resolved before/during implementation}
- {condition 2}
```

**Verdict definitions:**

| Verdict | Meaning | Next action |
|---------|---------|-------------|
| **GO** | KAC functional criteria met, evidence supports proceeding | Create implementation stories |
| **NO-GO** | KAC criteria not met, evidence shows this approach will not work | Document why, explore alternatives in a new spike or pivot |
| **GO WITH CAVEATS** | Partially met — proceed only if specific conditions are resolved | Create stories with caveat-resolution tasks included |

### 5. Identify Follow-up Actions

From the investigation, list concrete next steps:

```markdown
## Follow-up Actions

### Stories to create
- {story title — rationale from spike findings}
- {story title — rationale}

### Remaining uncertainties
- {uncertainty — proposed resolution approach}

### Dependencies discovered
- {dependency — who/what, impact on timeline}

### Technical debt / risks to track
- {item — why it matters}
```

### 6. Present Deliverable Draft

Show the complete deliverable to the user:

> **Spike deliverable ready for review.**
>
> - Format: {ADR / Trade-off / PoC Findings / Findings Summary}
> - KACs: {X} answered, {Y} partial, {Z} unanswered
> - Verdict: {GO / NO-GO / GO WITH CAVEATS}
> - Follow-up stories identified: {count}
>
> {full deliverable content}

### 7. Update WIP

Append the full deliverable content to WIP. Update `stepsCompleted` to include this step.

### 8. Present Menu

> **Synthesis complete.** The deliverable is ready for review.
>
> Before proceeding to formal review, please validate the synthesis:
> - Is the recommendation aligned with your understanding of the investigation?
> - Are the trade-offs and criteria weighted correctly?
> - Is anything missing from the follow-up actions?
>
> **[C]** Continue to review (Step 5)
> **[E]** Edit — modify the synthesis (recommendation, trade-offs, follow-up)
> **[Q]** Questions — ask about the synthesis methodology or specific sections

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **E**: Ask user what to edit. Apply edits. Re-present the deliverable. Redisplay menu.
- **Q**: Answer questions. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Deliverable follows the template structure
- Every claim backed by evidence from Step 3
- Recommendation has a clear verdict (GO / NO-GO / GO WITH CAVEATS)
- Recommendation is actionable (specific next steps, not vague)
- Follow-up actions identified
- All KACs addressed (even if PARTIAL/UNANSWERED — acknowledged explicitly)

### FAILURE:

- Recommendation without evidence references
- "Further investigation needed" as the only recommendation
- Missing verdict
- Deliverable content is opinion-based, not evidence-based
- KACs left UNANSWERED without acknowledgment
- Anti-patterns in ADR (Fairy Tale, Sprint, Tunnel Vision)
- Trade-off matrix with opinions instead of evidence-backed scores

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: Synthesize
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
