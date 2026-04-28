---
nextStepFile: './step-04-synthesize.md'
---

# Step 3: Investigate


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-03-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-03-ENTRY PASSED — entering Step 3: Investigate with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL:

Execute the core investigation — code analysis, web research, PoC prototyping (functional, executed), benchmarking, API exploration. For technical spikes, the PoC must run and produce documented results. This is the step where evidence is collected against each KAC.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are a systematic investigator — every claim needs evidence
- "I think X" is NEVER acceptable — go verify with code, docs, execution results
- Use subprocess per investigation axis when available (context savings)

### Step-Specific Rules:

- ALL investigation code lives in `{SPIKE_WORKTREE_PATH}` — NEVER in the main repo
- PoC code MUST be executed — "it should work based on docs" is NOT valid evidence
- Capture execution output (logs, metrics, screenshots) as part of findings
- DO NOT BE LAZY — investigate every KAC axis thoroughly
- Track timebox throughout

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before presenting menu
- Present A/P/C menu at end

---

## MANDATORY SEQUENCE

### 1. Search for Prior Attempts

Before planning the investigation, search for prior closed/rejected MRs or PRs related to this spike's topic:

```bash
{FORGE_CLI} mr list --state closed --search "{keywords}" 2>/dev/null || true
{FORGE_CLI} pr list --state closed --search "{keywords}" 2>/dev/null || true
```

If found: extract approach, rejection reason, reviewer comments. Prior failed attempts are critical evidence — they tell you what NOT to do and what objections to anticipate.

### 2. Plan Investigation Axes

Based on the spike type and KACs from Step 2, plan the investigation:

**For Technical Spikes:**

| Axis | Activities |
|------|-----------|
| **Prior attempts** | Analyze prior closed/rejected MRs — approaches tried, reasons for rejection, reviewer objections |
| **Codebase analysis** | Read relevant files in worktree, identify patterns, dependencies, integration points |
| **Web research** | Official docs, version-specific guides, known issues, migration guides, API references |
| **PoC prototyping** | Write functional code in worktree, execute it, capture results |
| **Benchmarking** | Define methodology, run measurements, capture raw data |
| **API exploration** | Test endpoints, verify auth, check rate limits, validate data formats |

**For Functional Spikes:**

| Axis | Activities |
|------|-----------|
| **Domain research** | Industry patterns, regulatory requirements, best practices |
| **UX research** | Competitor analysis, user flow patterns, accessibility standards |
| **Requirements analysis** | Edge cases, business rules, constraint discovery |
| **Stakeholder mapping** | What questions need external answers, who to consult |

Present the investigation plan to user. Ask if there are additional axes.

WAIT for confirmation.

### 2. Execute Investigation — Codebase Analysis (ALWAYS)

Inside `{SPIKE_WORKTREE_PATH}`:

- Read relevant files, identify patterns, conventions, dependencies
- Use subprocess per file when available (context savings)
- Trace the architecture relevant to the spike question
- Note test files and testing patterns
- Cross-reference against the tech-stack-lookup protocol (`~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`) if it exists
- Document findings with `file:line` references

**Checkpoint — present codebase findings before continuing:**

> **Codebase analysis complete.** Key findings:
> {summary of what was found — patterns, dependencies, integration points}
>
> **[C]** Continue to next investigation axis
> **[Q]** Questions about these findings
> **[D]** Add an investigation direction based on what we found

WAIT for selection. Process Q/D, redisplay menu. On C, continue.

### 3. Execute Investigation — Web Research (WHEN NEEDED)

- Use WebSearch for official documentation (version-specific)
- Search for known issues, gotchas, breaking changes, migration guides
- Look for community experience reports, benchmarks, comparisons
- **Document every source with URL** for traceability
- Distinguish official documentation from community opinions

**Checkpoint — present research findings before continuing:**

> **Web research complete.** Key findings:
> {summary — approaches identified, best practices, gotchas}
>
> **[C]** Continue to next investigation axis
> **[Q]** Questions about these findings
> **[D]** Add an investigation direction based on what we found

WAIT for selection. Process Q/D, redisplay menu. On C, continue.

### 4. Execute Investigation — PoC Prototyping (TECHNICAL SPIKES)

**This is MANDATORY for technical spikes. The PoC must execute and produce results.**

a. **Write PoC code in the worktree:**
   - Minimum viable code to test the hypothesis
   - No polish, no tests, no error handling beyond what's needed for the experiment
   - Include a README or comments explaining what the PoC does and how to run it

b. **Execute the PoC:**
   - Run the code
   - Capture output (stdout, stderr, logs)
   - If it fails: document the failure, diagnose, fix or document as a finding
   - If it succeeds: capture evidence (output, timing, behavior)

c. **Document execution results:**

```markdown
### PoC Execution Results

**Command:** `{exact command used}`
**Environment:** {OS, runtime version, relevant config}
**Output:**
```
{captured stdout/stderr}
```
**Verdict:** {PASS | FAIL | PARTIAL}
**Observations:** {what was learned}
```

d. **CRITICAL:** If the PoC cannot be executed in the current environment (needs cloud resources, external service, etc.):
   - Document exactly what is needed to run it
   - Explain why it cannot be run here
   - Propose an alternative verification approach
   - Ask user how to proceed — do NOT silently skip

**Checkpoint — present PoC results before continuing:**

> **PoC prototyping complete.** Results:
> {summary — what ran, what passed/failed, key observations}
>
> **[C]** Continue to next investigation axis
> **[Q]** Questions about the PoC results
> **[D]** Add an investigation direction based on what we found

WAIT for selection. Process Q/D, redisplay menu. On C, continue.

### 5. Execute Investigation — Benchmarking (WHEN PERFORMANCE KACs EXIST)

Follow benchmarking best practices:

a. **Define methodology:**
   - Metric under test (latency, throughput, memory, CPU)
   - Workload characteristics (data volume, concurrency, distribution)
   - Environment specification (hardware, OS, runtime versions, config)

b. **Execute measurements:**
   - Warm-up runs to avoid cold-start effects
   - Minimum 10 iterations (30+ for statistical significance)
   - Isolate the variable under test — change one thing at a time

c. **Report results:**

```markdown
### Benchmark Results

**Metric:** {what was measured}
**Methodology:** {how — workload, iterations, environment}
**Results:**
| Run | Value | Notes |
|-----|-------|-------|
| 1-N | ... | ... |

**Summary:** mean={X}, stddev={Y}, p95={Z}
**Target:** {from KAC functional criterion}
**Verdict:** {MET | NOT MET | INCONCLUSIVE}
```

d. Pin dependency versions, provide runnable script for reproduction

**Checkpoint — present benchmark results before continuing:**

> **Benchmarking complete.** Results:
> {summary — metrics, targets met/missed, key observations}
>
> **[C]** Continue to next investigation axis
> **[Q]** Questions about the benchmark results
> **[D]** Add an investigation direction based on what we found

WAIT for selection. Process Q/D, redisplay menu. On C, continue.

### 6. Cross-Reference with Standards

Using `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md` (loaded in INITIALIZATION):
- Cross-reference findings against project standards
- Note conflicts (e.g., "the tech-stack section forbids library X, but it's the best option for this use case")
- Note alignments (e.g., "consistent with existing pattern Y")

### 7. Timebox Check

Check elapsed sessions vs. `TIMEBOX_SESSIONS`:

> **Timebox check:** Session {N} of {TIMEBOX_SESSIONS}.

**If approaching limit (last session):**

> **Timebox alert:** This is the last planned session. Remaining KACs:
> {list of UNANSWERED/PARTIAL KACs}
>
> **[E]** Extend timebox (add {N} sessions)
> **[W]** Wrap up with current findings — proceed to synthesis
> **[C]** Continue investigating (still within budget)

WAIT for selection.

- **E**: Update `TIMEBOX_SESSIONS` in WIP, continue
- **W**: Proceed to synthesis with current findings (document incomplete KACs)
- **C**: Continue (only if actually within budget)

### 8. KAC Progress Assessment

For each KAC, assess status:

| Status | Meaning |
|--------|---------|
| **ANSWERED** | Sufficient evidence to answer — functional criteria met |
| **PARTIAL** | Some evidence, not fully conclusive |
| **UNANSWERED** | No evidence yet |

Present progress:

```markdown
### KAC Status

| KAC | Status | Evidence |
|-----|--------|----------|
| KAC-1 | ANSWERED | PoC runs, benchmark shows p95=45ms < 200ms target |
| KAC-2 | PARTIAL | API docs confirm compatibility, but rate limit untested |
| KAC-3 | UNANSWERED | Not yet investigated |
```

If any KAC is UNANSWERED, ask user: continue investigating or proceed with partial knowledge?

### 9. Document Investigation Log

Append to WIP all findings per axis:
- Codebase analysis findings (file:line references)
- Web research findings (URLs)
- PoC execution results (commands, output, verdict)
- Benchmark results (methodology, raw data, summary)
- KAC status assessment

### 10. Update WIP

Set `stepsCompleted` to include this step.

### 11. Present Menu

> **Investigation complete.** KAC status: {X} answered, {Y} partial, {Z} unanswered.
>
> **[A]** Advanced Elicitation — challenge the investigation findings
> **[P]** Party Mode — get multiple perspectives on the findings
> **[C]** Continue to synthesis (Step 4)

Process selection:
- **A**: Run `{advanced_elicitation}`, process, accept/reject, redisplay menu
- **P**: Run `{party_mode}`, process, accept/reject, redisplay menu
- **C**: Save WIP, load, read entire file, execute {nextStepFile}

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- All planned investigation axes executed
- PoC code written, executed, and results captured (technical spikes)
- Findings documented with evidence (file:line, URLs, execution output)
- Benchmarks run with proper methodology (if applicable)
- KAC status assessed with evidence
- Timebox respected or explicitly extended
- Investigation log appended to WIP

### FAILURE:

- Skipping investigation axes
- PoC not executed ("should work based on docs")
- Claims without evidence
- Single benchmark run reported as conclusive
- Ignoring timebox
- PoC code written outside the worktree

---

## STEP EXIT (CHK-STEP-03-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-03-EXIT PASSED — completed Step 3: Investigate
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
