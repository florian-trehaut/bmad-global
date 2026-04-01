---
nextStepFile: './step-07-publish.md'
---

# Step 6: Draft ADR & Self-Review

## STEP GOAL:

Compose the complete ADR from accumulated state using the correct format template. Run a lightweight self-review (same criteria as bmad-adr-review). Present for user approval before publication.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- You are the document composer and quality reviewer
- The ADR must be complete and publication-ready before proceeding
- Self-review is mandatory — it catches issues before they reach formal review

### Step-Specific Rules:

- Load the correct template based on `ADR_FORMAT`
- Self-review against `../data/self-review-checklist.md` is MANDATORY
- Anti-pattern scan against `../data/anti-patterns.md` is MANDATORY
- The user MUST explicitly select C to proceed to publication
- Generate a Y-statement as a sanity check

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP before presenting menu
- Present menu — user must confirm with C

---

## MANDATORY SEQUENCE

### 1. Load ADR Template

Based on `ADR_FORMAT`:

| Format | Template |
|--------|----------|
| `madr` | `../data/adr-template-madr.md` |
| `nygard` | `../data/adr-template-nygard.md` |
| `custom` | Search `{ADR_LOCATION}` for a template file, fallback to MADR |
| `unknown` | Default to MADR |

### 2. Compose ADR

Fill the template with all accumulated state:

**MADR format fields:**
- YAML frontmatter: status `proposed`, date, decision-makers (from `DECISION_MAKERS` list captured in step-02)
- Title: `{NEXT_ADR_NUMBER}. {title}`
- Context and Problem Statement: from step-02 `PROBLEM_STATEMENT`
- If `SUPERSEDES_ADR`: add supersession note in context
- Decision Drivers: from step-02 `DECISION_DRIVERS`
- Considered Options: from step-03 `OPTIONS` + step-04 `EVIDENCE` (each with pros, cons, evidence sources)
- Decision Outcome: from step-05 `DECISION` (chosen option, justification)
- Consequences: from step-05 (positive, negative)
- Confirmation: how compliance will be verified (code reviews, tests, etc.)
- Risks and Mitigations: from step-05
- More Information: links to related ADRs, investigation artifacts, discussions

**Nygard format fields:**
- Title, date, status
- Context: narrative combining problem, forces, drivers
- Decision: "We will..." with justification and rejected options
- Consequences: positive, negative, risks combined

### 3. Self-Review

Load `../data/self-review-checklist.md` and evaluate the draft against each check:

| # | Check | Status | Detail |
|---|-------|--------|--------|
| 1 | Context neutral (problem, not solution) | {PASS/CONCERN} | ... |
| 2 | At least 3 options (incl. do-nothing) | {PASS/CONCERN} | ... |
| 3 | Every pro/con has evidence source | {PASS/CONCERN} | ... |
| 4 | Justification references evidence + drivers | {PASS/CONCERN} | ... |
| 5 | Negative consequences documented | {PASS/CONCERN} | ... |
| 6 | Risks have actionable mitigations | {PASS/CONCERN} | ... |
| 7 | Operational/cross-team/security addressed | {PASS/CONCERN} | ... |

**Scoring:**
- All PASS → "Self-review: PASS"
- 1-3 CONCERN → "Self-review: CONCERN — address before publication"
- 4+ CONCERN → "Self-review: FAIL — return to earlier steps"

<check if="any CONCERN">
  Present the specific issues and offer to fix them:
  "Self-review found {N} concern(s):
  - {check}: {detail}

  I can fix these now. Should I apply corrections? [Y/N]"

  If Y: Apply fixes to the draft. Re-run self-review.
  If N: Proceed with concerns noted.
</check>

### 4. Anti-Pattern Scan

Load `../data/anti-patterns.md` and apply detection heuristics against the draft:

For each anti-pattern (Fairy Tale, Sprint, Tunnel Vision, Retroactive Fiction):
- Count matching heuristics
- If >= 2 heuristics match: flag the pattern

<check if="any anti-pattern detected">
  "Our draft triggers the **{pattern_name}** anti-pattern because:
  - {matching heuristic 1}
  - {matching heuristic 2}

  Suggested fix: {specific action}

  Should I apply this fix? [Y/N]"

  If Y: Apply fix, re-scan.
  If N: Proceed with anti-pattern noted.
</check>

### 5. Generate Y-Statement

Compose a one-line Y-statement summary for quick reference:

> "In the context of {functional context}, facing {quality concern / constraint}, we decided for {chosen option} and against {rejected alternatives}, to achieve {benefits}, accepting that {trade-offs}."

Present alongside the full ADR as a sanity check — if the Y-statement doesn't make sense, the ADR has a coherence problem.

### 6. Present Complete ADR

> **ADR Draft — Ready for Review**
>
> **Self-review:** {N_pass} PASS, {N_concern} CONCERN
> **Anti-patterns detected:** {list or "none"}
>
> **Y-statement:** {statement}
>
> ---
>
> {full ADR content}

### 7. Update WIP

Store `ADR_DRAFT` and self-review results. Update `stepsCompleted: [1, 2, 3, 4, 5, 6]`.

### 8. Present Menu

> **[C]** Continue to publish (Step 7)
> **[E]** Edit — modify the ADR content
> **[R]** Adversarial Review — formal critical review of the draft (invokes bmad-review-adversarial-general)
> **[A]** Advanced Elicitation — challenge specific sections
> **[P]** Party Mode — multi-perspective review
> **[Q]** Questions about the ADR content

**Menu handling:**

- **C**: Save WIP, load, read entire file, execute {nextStepFile}
- **E**: Ask what to edit. Apply changes. Re-run self-review and anti-pattern scan. Re-present ADR. Redisplay menu.
- **R**: Invoke `skill:bmad-review-adversarial-general` with the ADR text. Present findings. User accepts/rejects each. Apply accepted changes. Re-present. Redisplay menu.
- **A**: Invoke `skill:bmad-advanced-elicitation` with specific sections. Process insights. Apply. Redisplay menu.
- **P**: Invoke `skill:bmad-party-mode` with ADR context. Process perspectives. Apply. Redisplay menu.
- **Q**: Answer questions. Redisplay menu.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Complete ADR composed from the correct template
- Self-review executed — all checks PASS or concerns addressed
- Anti-pattern scan executed — clean or issues addressed
- Y-statement generated and coherent
- User explicitly selected C to proceed

### FAILURE:

- Composing without loading the template
- Skipping self-review
- Skipping anti-pattern scan
- Auto-proceeding without user C selection
- Not offering to fix detected issues
