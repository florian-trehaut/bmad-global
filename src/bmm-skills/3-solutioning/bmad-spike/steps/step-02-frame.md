---
nextStepFile: './step-03-investigate.md'
---

# Step 2: Frame the Spike


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Frame the Spike with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Classify the spike type, define a crisp answerable question, set knowledge acceptance criteria with functional verification criteria, establish a timebox, and choose the output deliverable format.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You help the user sharpen their question from vague uncertainty into a crisp, answerable investigation
- You propose structure; the user validates and adjusts
- You challenge scope creep — a spike answers ONE question, not five

### Step-Specific Rules:

- KACs for technical spikes MUST include functional verification criteria (the PoC runs and produces measurable results)
- The timebox must be explicit and agreed upon
- Do NOT start investigating — framing only

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Present A/P/C menu at end

---

## MANDATORY SEQUENCE

### 1. Classify Spike Type

Ask targeted questions to determine the spike type:

- **Technical spike**: Feasibility, architecture choice, technology comparison, performance validation, integration approach, API compatibility
- **Functional spike**: Business requirements clarity, user flow, domain understanding, UX patterns, regulatory constraints, workflow design
- **Hybrid**: Both technical and functional dimensions (common — e.g., "Can we meet compliance requirement X with technology Y?")

Present classification and confirm with user.

### 2. Formalize the Spike Question

Transform the user's initial description into a crisp, answerable statement:

```markdown
**Spike Question:** {one clear, specific, bounded question}
```

Quality checks for the question:
- **Specific**: Not "investigate performance" but "Can service X handle 10k concurrent WebSocket connections with <100ms message latency?"
- **Answerable**: Produces a yes/no/recommendation with evidence, not open-ended exploration
- **Bounded**: Scope is clear — what is included, what is explicitly excluded
- **Falsifiable**: It is possible for the answer to be "no" or "this approach does not work"

Present the formalized question. Ask user to confirm or refine.

### 3. Define Knowledge Acceptance Criteria (KACs)

KACs define what knowledge the spike must produce. They are NOT implementation acceptance criteria.

**For technical spikes, KACs MUST include functional verification criteria:**

```markdown
### Knowledge Acceptance Criteria

- [ ] KAC-1: {knowledge outcome with functional proof}
  - Functional criterion: {what the PoC must demonstrably do — e.g., "PoC processes 1000 messages/sec with p95 < 200ms"}
- [ ] KAC-2: {knowledge outcome}
  - Functional criterion: {measurable execution result}
- [ ] KAC-3: {recommendation deliverable}
```

**Good KAC examples (technical):**
- "KAC-1: Feasibility of Provider X webhook integration — Functional criterion: PoC receives and parses webhook events in <50ms end-to-end"
- "KAC-2: Performance comparison of Redis vs Memcached for session storage — Functional criterion: Benchmark with 10k concurrent reads shows p95 latency and throughput"
- "KAC-3: Written recommendation with trade-off analysis for team review"

**Good KAC examples (functional):**
- "KAC-1: Complete user journey mapping for multi-step onboarding — Deliverable: documented flow with decision points and edge cases"
- "KAC-2: Regulatory constraints inventory for GDPR data residency — Deliverable: checklist of requirements with source references"

**Bad KAC examples (reject these):**
- "Evaluate feasibility" (not specific, no functional criterion)
- "Working endpoint" (implementation, not knowledge)
- "Understand the API" (vague, unmeasurable)

Present proposed KACs. Iterate with user until each KAC is specific and verifiable.

### 4. Set Timebox

Ask user for investigation time budget. Present suggestions based on spike type:

| Size | Typical use | Duration |
|------|-------------|----------|
| **Small** | API check, library evaluation, single-question feasibility | 1 session (~2h) |
| **Medium** | Architecture comparison, PoC with benchmarks, multi-option trade-off | 2-3 sessions |
| **Large** | Full feasibility study, complex PoC with multiple integration points | 3-5 sessions |

Confirm the timebox with the user. Store `TIMEBOX_SESSIONS` in WIP.

**Rule:** The timebox is a hard constraint. When it expires, the spike delivers findings based on what was discovered — even if incomplete. "We couldn't prove it in {N} sessions" is itself a valuable finding.

### 5. Choose Output Format

Based on spike type and question, recommend and confirm the deliverable format:

| Format | When to Use | Produces |
|--------|-------------|----------|
| **ADR** (Architecture Decision Record) | Choosing between architecture/technology options | Structured decision with context, options, pros/cons, recommendation |
| **Trade-off Matrix** | Comparing 2+ options on multiple weighted criteria | Scored comparison with sensitivity analysis |
| **PoC Findings** | Validating feasibility through a working prototype | Hypothesis, execution results, go/no-go verdict |
| **Findings Summary** | General investigation, requirements discovery, domain research | Structured findings with evidence and confidence levels |

Formats can be combined (e.g., PoC Findings + ADR when a prototype informs a technology choice).

Present recommendation and confirm with user.

### 6. Quick Context Scan

Scan tracker and codebase for relevant existing context:

- Related issues, epics, documents in the tracker
- Existing code patterns, libraries, configurations relevant to the question
- Prior spikes or ADRs on related topics

Note: what is already known vs. what needs investigation. This prevents duplicate work.

### 7. Update WIP File

Append the framing section to WIP:
- `spike_type: {technical | functional | hybrid}`
- `spike_question: {formalized question}`
- `kacs: {list of KACs with functional criteria}`
- `timebox: {TIMEBOX_SESSIONS} sessions`
- `output_format: {adr | tradeoff | poc | findings | combined}`
- `related_context: {brief summary of existing context found}`

Update `stepsCompleted` to include this step.

### 8. Present Menu

> **Spike framed.** Question, KACs, timebox, and output format are set.
>
> **[A]** Advanced Elicitation — push deeper on the framing
> **[P]** Party Mode — get multiple agent perspectives on the framing
> **[C]** Continue to investigation (Step 3)

Process selection:
- **A**: Run `{advanced_elicitation}`, process output, accept/reject changes, redisplay menu
- **P**: Run `{party_mode}`, process output, accept/reject changes, redisplay menu
- **C**: Save WIP, load, read entire file, execute {nextStepFile}

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Spike type classified and confirmed
- Question crisp, specific, answerable, falsifiable
- KACs include functional verification criteria (for technical spikes)
- Timebox agreed with user
- Output format chosen
- Existing context scanned (no duplicate work)
- WIP updated with full framing

### FAILURE:

- KACs that are implementation ACs instead of knowledge ACs
- Open-ended question without bounds
- No timebox set
- Skipping functional criteria for technical spike KACs
- Starting investigation before framing is complete

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Frame the Spike
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
