# ADR Anti-Patterns

Detection rules for common ADR reasoning anti-patterns. Used during self-review (step-06) to verify the draft ADR does not exhibit these patterns.

Source: Shared with bmad-adr-review. Derived from bmad-spike ADR template quality checklist and Olaf Zimmer's ADR anti-pattern taxonomy.

---

## 1. Fairy Tale

**Description:** The ADR paints an unrealistically positive picture of the chosen option. Only pros are listed, cons are absent or trivial, and the justification is tautological ("we chose X because X is the best option").

**Detection heuristics:**

- Chosen option has 0 cons listed, or cons are vague/dismissable ("minor learning curve")
- Rejected options have more cons than pros
- Justification restates the option name rather than referencing evidence
- Positive consequences listed but no negative consequences
- Pros use superlatives ("best", "most performant", "ideal") without measurements

**Severity:** MAJOR

**Prevention (during creation):** Step 5 forces at least 1 negative consequence. Step 4 requires evidence-backed cons for every option including the preferred one.

**Remediation:** Add specific, honest negative consequences. Each rejected option should have at least one genuine pro documented.

---

## 2. Sprint

**Description:** Only one option was seriously considered. The ADR was written to justify a pre-made decision, not to explore alternatives. Only short-term effects are discussed — long-term operational and maintenance consequences are absent.

**Detection heuristics:**

- Only 1 option has detailed pros/cons/evidence; others are one-liners
- "Do nothing" / status quo not considered
- Consequences section only covers immediate effects (next sprint/quarter)
- No mention of operational burden, maintenance cost, or technical debt implications
- Evidence exists only for the chosen option

**Severity:** MAJOR

**Prevention (during creation):** Step 3 requires minimum 3 options including "do nothing". Step 4 gathers evidence for ALL options with equal depth.

**Remediation:** Evaluate at least 2 alternatives with equal depth. Include "do nothing" as a baseline. Add long-term consequences (1+ year horizon).

---

## 3. Tunnel Vision

**Description:** The ADR considers only the local, immediate technical context. Operational, maintenance, security, cross-team, and organizational impacts are ignored.

**Detection heuristics:**

- No mention of: deployment, monitoring, alerting, runbooks
- No mention of: other teams, consumers, downstream dependencies
- No mention of: security implications, compliance, data privacy
- Consequences are purely functional ("feature X will work") with no operational dimension
- Risk section absent or contains only technical risks (no organizational/process risks)

**Severity:** MINOR (individual finding), escalates to MAJOR if combined with missing NFR considerations

**Prevention (during creation):** Step 5 includes a mandatory Tunnel Vision check covering operational, cross-team, security, and maintenance dimensions.

**Remediation:** Add sections addressing: operational impact (deployment, monitoring), security implications, cross-team dependencies, and maintenance burden.

---

## 4. Retroactive Fiction

**Description:** The ADR was written after the decision was already implemented, from memory rather than during the investigation. Evidence references are vague or post-hoc — no investigation artifacts exist.

**Detection heuristics:**

- Evidence section references "our experience" or "we know that" without specific sources
- No PoC results, no benchmark data, no documentation URLs
- ADR date is after the implementation date (if detectable from git history)
- Claims reference implementation details that only exist because the decision was already made
- No spike, RFC, or investigation artifact linked

**Severity:** MAJOR (if evidence is entirely absent), MINOR (if some evidence exists but is weak)

**Prevention (during creation):** Step 4 gathers evidence in real-time during the workflow — codebase analysis, web research, user-provided references. Every claim gets a source as it is created.

**Remediation:** Link each claim to a verifiable evidence source: PoC repository, benchmark results, documentation URL, or investigation artifact.

---

## Combined Detection

When multiple anti-patterns co-occur, escalate severity:

| Combination | Escalation |
|-------------|-----------|
| Fairy Tale + Sprint | BLOCKER — pre-decided with no honest evaluation |
| Tunnel Vision + Sprint | MAJOR — narrow scope with no alternatives |
| Retroactive Fiction + any other | MAJOR — unreliable evidence compounds any other flaw |
| All 4 present | BLOCKER — ADR is not a genuine decision record |
