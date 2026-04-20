# OWASP LLM Top 10 (2025) + Agentic Security Initiative Top 10 — Mapping Reference

**Consumed by:** sub-axis 3b (AI / Agentic Safety). Every finding MUST carry either an `llm_risk: LLMXX` or `asi_risk: ASIXX` tag.

References:
- <https://genai.owasp.org/llm-top-10/> — OWASP Top 10 for LLM Applications (2025)
- <https://genai.owasp.org/agentic-top-10/> — Agentic Security Initiative (ASI) Top 10 (2026)

---

## OWASP LLM Top 10 (2025)

### LLM01 — Prompt Injection

Direct or indirect injection of instructions that override the system prompt.

**Indirect prompt injection is the dominant enterprise threat** (Anthropic Feb 2026 system card): attacker-controlled content in RAG corpora, tool outputs, or retrieved documents.

**Defensive patterns:**
- Explicit boundary markers around untrusted content (`<user_input>...</user_input>`)
- Never concatenate untrusted content into the system prompt
- Sanitise retrieved document content before prompt injection
- Tool outputs should be sandboxed with provenance metadata

### LLM02 — Sensitive Information Disclosure

Model leaking training data, system prompts, PII, or secrets from context.

**Defensive patterns:**
- Never echo the system prompt back in error paths
- Strip secrets from context before model invocation
- Output filtering for PII / PAN / API keys
- Use separate provider keys per tenant / environment

### LLM03 — Supply Chain

Model origin, fine-tuning dataset trust, model weights integrity, adversarial model modifications.

**Defensive patterns:**
- Pin model versions in production
- Verify model hash against registry
- Scan training data for poisoning signals
- Never fine-tune on user-submitted data without review

### LLM04 — Data and Model Poisoning

Training or fine-tuning data compromised to embed backdoors.

**Defensive patterns:**
- Control training data provenance
- Differential testing on canary prompts after fine-tune
- MLOps gate: no unreviewed dataset → no production model

### LLM05 — Improper Output Handling

Model output treated as trusted — injected into SQL, shell, HTML without validation.

**Defensive patterns:**
- Treat model output as untrusted user input
- Escape / sanitise before rendering or execution
- Never execute model output as code without a sandbox

### LLM06 — Excessive Agency

Agent has tools with higher privileges than needed, or insufficient human-in-the-loop checks.

**Historical incident:** Replit July 2025 — an autonomous agent deleted a production database.

**Defensive patterns:**
- Tool trust-tier tagging (`trust_tier: high | medium | low`)
- Human approval gate on destructive operations
- Least-privilege tool surface per agent
- Tool execution audit log

### LLM07 — System Prompt Leakage

System prompt content exposed through outputs, error paths, or debug modes.

**Defensive patterns:**
- Error messages never echo the system prompt
- Debug endpoints disabled in production
- System prompts should never contain secrets (treat as disclosed)

### LLM08 — Vector and Embedding Weaknesses

Embedding model drift, vector DB poisoning, retrieval contamination.

**Defensive patterns:**
- Provenance tagging on every vector entry
- Periodic re-embedding on model upgrades
- Retrieval-time trust-tier filtering

### LLM09 — Misinformation

Model confidently generating incorrect information treated as authoritative.

**Defensive patterns:**
- Ground generation in retrieved sources with citations
- Confidence scoring and thresholds
- Human review for high-stakes outputs

### LLM10 — Unbounded Consumption

No cost cap, no step budget, no wall-clock timeout on agent execution.

**Defensive patterns:**
- Per-request cost cap
- Agent loop step budget (`maxSteps: N`)
- Wall-clock timeout
- Circuit breaker on cost overruns

---

## ASI (Agentic Security Initiative) Top 10 (2026)

### ASI01 — Memory Poisoning

Long-term memory writes that embed adversarial instructions (MINJA attack, >95% injection rate on naive implementations).

**Defensive patterns:**
- Memory writes go through a sanitisation layer
- Provenance tagging on every memory entry
- Retrieval-time anomaly detection

### ASI02 — Tool Misuse

Agent invokes tools outside its permitted scope.

**Defensive patterns:**
- Per-agent tool allow-list
- Runtime enforcement at tool-dispatch layer (not just prompt-level)

### ASI03 — Privilege Compromise

Agent accumulates privileges across sessions or actions.

**Defensive patterns:**
- Per-session credential issuance (short-lived tokens)
- Audit every privilege elevation

### ASI04 — Resource Exhaustion

Agent consumes compute / API quota without bounds.

Overlaps with LLM10.

### ASI05 — Cascading Hallucination Attacks

One agent's hallucinated output becomes another agent's trusted input.

**Defensive patterns:**
- Treat inter-agent messages as untrusted
- Ground every inter-agent handoff in verifiable data (not free-form LLM output)

### ASI06 — Intent Breaking and Goal Manipulation

User or attacker redirects the agent's goal through successive prompts.

**Defensive patterns:**
- Goal pinning (system prompt declares the immutable goal)
- Per-turn goal drift detection

### ASI07 — Misaligned and Deceptive Behaviors

Agent outputs appear goal-aligned but subtly deviate.

**Defensive patterns:**
- Chain-of-thought audit for high-stakes actions
- Differential testing (known-good vs current behaviour)

### ASI08 — Repudiation

Agent actions lack attribution / audit trail.

**Defensive patterns:**
- Cryptographically signed action log
- User-attributed invocation (never bare "agent did this")

### ASI09 — Identity Spoofing and Impersonation

Attacker causes the agent to act as another user.

**Defensive patterns:**
- Per-request user identity re-verification
- Never trust `user_id` in message payloads — derive from auth context

### ASI10 — Overreliance (Automation Bias)

Humans rubber-stamp agent actions without review.

**Defensive patterns:**
- Forcing-function UI: user must type the action name (not click `Approve`)
- Randomised cost / time challenges for high-stakes operations

---

## Severity Defaults

- LLM01 (prompt injection) in production code path → **BLOCKER**
- LLM06 (excessive agency) without approval gate on destructive tool → **BLOCKER**
- LLM07 (system prompt leakage) via error path → **BLOCKER**
- ASI01 (memory poisoning) with naive ingestion → **BLOCKER**
- ASI05 (cascading hallucination) on cross-service flow → **BLOCKER**
- Other LLM01-10 and ASI01-10 default to WARNING unless concrete exploit chain exists
