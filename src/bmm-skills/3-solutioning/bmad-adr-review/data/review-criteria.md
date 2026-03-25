# ADR Review Criteria

Evaluation framework for ADR reviews. Loaded by step-03-evaluate.md and step-06-present.md.

---

## Evaluation Categories

7 review axes applied to every ADR. Each axis produces findings with severity and evidence.

### 1. FACT_CHECK

**What it checks:** Technical claims verified against codebase.

**Method:**
- Extract every claim of the form "the system uses X", "we currently do Y", "component Z handles..."
- For each claim, search the codebase (grep, glob, read) for confirming or contradicting evidence
- Mark each claim: VERIFIED (evidence found) / UNVERIFIED (no evidence, cannot confirm or deny) / CONTRADICTED (evidence contradicts)

**Severity mapping:**
- CONTRADICTED claim → BLOCKER (the ADR contains false information)
- UNVERIFIED claim about a critical decision driver → MAJOR
- UNVERIFIED claim about context/background → MINOR

### 2. REASONING

**What it checks:** Logic chain from evidence to decision — bias detection, gaps in justification.

**Method:**
- Trace: decision drivers → evidence → option evaluation → decision outcome
- Check: does the justification reference specific evidence, or is it generic?
- Check: are rejected options dismissed with the same rigor as the chosen option is supported?
- Check: does the decision follow logically from the stated drivers and evidence?

**Severity mapping:**
- Decision contradicts stated evidence → BLOCKER
- Justification is generic / not traced to evidence → MAJOR
- Minor logical gap (non-critical) → MINOR

### 3. ALTERNATIVES

**What it checks:** Options considered — completeness and fairness of evaluation.

**Method:**
- Count options: minimum 2 (including status quo / do nothing)
- Check: is each option evaluated with equal depth (pros, cons, evidence)?
- Check: are there obvious alternatives not considered?
- Check: is "do nothing" seriously evaluated or dismissed perfunctorily?

**Severity mapping:**
- Only 1 option seriously considered → MAJOR (Sprint anti-pattern)
- "Do nothing" not considered when applicable → MAJOR
- Options evaluated with unequal depth → MINOR

### 4. COHERENCE

**What it checks:** Alignment with existing architecture, patterns, and project direction.

**Method:**
- Check: does the proposed decision align with existing architectural patterns in the codebase?
- Check: does it conflict with other recent or known ADRs?
- Check: does it introduce patterns that diverge from the project's established conventions?
- Check: is the decision consistent with the project's stated technical direction?

**Severity mapping:**
- Decision contradicts existing architecture with no migration plan → BLOCKER
- Decision introduces inconsistent patterns without justification → MAJOR
- Minor style/convention divergence → INFO

### 5. CONSEQUENCES

**What it checks:** Completeness of positive/negative consequences and risks.

**Method:**
- Check: are both positive AND negative consequences listed?
- Check: are negative consequences honest and specific (not vague hand-waving)?
- Check: are operational, maintenance, and cross-team impacts addressed?
- Check: are risks identified with specific mitigations (not "we'll handle it later")?

**Severity mapping:**
- No negative consequences listed → MAJOR (Fairy Tale anti-pattern)
- Risks without mitigations on a critical path → MAJOR
- Missing operational/maintenance consequences → MINOR (Tunnel Vision)

### 6. EVIDENCE

**What it checks:** Quality and sufficiency of evidence supporting the decision.

**Method:**
- Check: does each pro/con reference a concrete evidence source (PoC, benchmark, doc, code)?
- Check: are evidence sources verifiable (URLs, file paths, test results)?
- Check: is the evidence current (not outdated references)?
- Check: are claims of performance/scalability backed by measurements?

**Severity mapping:**
- Decision based on no evidence (pure opinion) → BLOCKER
- Key claims without verifiable evidence → MAJOR
- Minor claims without evidence → MINOR
- Evidence exists but is dated → INFO

### 7. NFR_READINESS

**What it checks:** Testability, operability, security, and scalability implications.

**Method:**
- Auto-select relevant NFR categories based on ADR content (see nfr-lite-checklist.md)
- Scan selected categories only — NOT all 29 criteria
- Flag gaps as findings with pointer to full nfr-assess for comprehensive evaluation

**Severity mapping:**
- Security gap in a security-sensitive decision → MAJOR
- Testability gap → MINOR
- Other NFR gaps → INFO (with pointer to bmad-nfr-assess)

---

## Finding Schema

Every finding produced during the review follows this structure:

```yaml
finding:
  id: F-{N}
  category: FACT_CHECK | REASONING | ALTERNATIVES | COHERENCE | CONSEQUENCES | EVIDENCE | NFR_READINESS
  severity: BLOCKER | MAJOR | MINOR | INFO
  title: "Short description"
  detail: "What was found, with evidence"
  evidence: "Code reference, grep result, or quote from ADR"
  proposed_action: "Concrete, executable action for the ADR author"
  adr_section: "Which section of the ADR this relates to"
```

**Severity definitions:**

| Severity | Meaning | Impact on verdict |
|----------|---------|-------------------|
| BLOCKER | Fundamental flaw — ADR cannot be approved as-is | Forces REJECT |
| MAJOR | Significant issue — requires correction before approval | Accumulates toward IMPROVE/REJECT |
| MINOR | Non-critical concern — should be addressed but not blocking | Noted in report |
| INFO | Observation or suggestion — no action required | Noted in report |

---

## Verdict Model

```yaml
verdict:
  decision: APPROVE | IMPROVE | REJECT
  confidence: HIGH | MEDIUM | LOW
  summary: "One-line justification"
  findings_summary:
    blocker: N
    major: N
    minor: N
    info: N
  conditions:  # Only for IMPROVE verdict
    - "Condition that must be addressed"
```

### Decision Rules

| Verdict | Conditions |
|---------|-----------|
| **APPROVE** | 0 BLOCKERs AND ≤2 MAJORs (all with clear mitigations) AND decision is sound |
| **IMPROVE** | 0 BLOCKERs AND (>2 MAJORs OR MAJORs without clear mitigations) AND decision direction is sound but execution needs work |
| **REJECT** | ≥1 BLOCKER OR fundamental reasoning flaw OR evidence contradicts decision |

### Confidence Rules

| Confidence | Conditions |
|------------|-----------|
| **HIGH** | All claims fact-checked, evidence verified, codebase thoroughly scanned |
| **MEDIUM** | Most claims checked, some evidence could not be verified (external references) |
| **LOW** | Limited codebase access, many claims unverifiable, time-constrained review |
