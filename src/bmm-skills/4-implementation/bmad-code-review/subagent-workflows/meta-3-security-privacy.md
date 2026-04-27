---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
meta: 3
meta_weight: 0.25
voting: true
---

# Meta-3 Subagent Workflow: Security & Privacy

**Goal:** Verify the MR does not introduce exploitable vulnerabilities, regulatory violations, or supply-chain risks.

**Sub-axes (4):**

| Sub-axis | Name | Always-on | Voting |
|----------|------|-----------|--------|
| 3a | Security (OWASP Top 10:2025) | ✓ | S1 + S2 |
| 3b | AI / Agentic Safety | conditional (LLM SDK imports) | S1 + S2 |
| 3c | Data Privacy (GDPR / EAA / AI Act Art.26) | conditional (entities/schemas/migrations) | — |
| 3d | Supply Chain (SLSA / SBOM / typosquat) | conditional (manifest/lockfile diffs) | — |

Meta-3 is dispatched TWICE from the orchestrator — once as S1 (attacker POV, creativity low) and once as S2 (defender POV, creativity medium). Judge-triage applies voting consensus on the 3a + 3b findings (CONFIRMED vs SINGLE_REVIEWER) per §6.5 of the Tech Spec.

---

## ANTI-DEVIATION CONTRACT

Same as other metas. READ-ONLY, no coordination with the other security reviewer, never downgrade BLOCKER.

**POV framing from `contract.pov`:**

- If `pov: attacker` → enumerate concrete exploit chains; prefer depth on known CVE classes; only report with plausible exploit chain.
- If `pov: defender` → enumerate defense-in-depth risks; prefer breadth; surface latent risks even without confirmed exploit chain.

---

## SUB-AXIS 3a: Security (OWASP Top 10:2025)

**Condition:** Always-on when Meta-3 runs.

### Phase 3 baseline (from v1 Perspective: security)

- Injection: SQL raw concat, command exec/spawn, XSS
- Auth/AuthZ: missing guards/decorators, privilege escalation
- Input validation: missing DTOs, validation decorators
- Sensitive data: secrets/PII in logs, hardcoded credentials
- Crypto: weak MD5/SHA1, `Math.random()` for security
- Race conditions: TOCTOU, missing transactions
- Framework config: missing security headers, permissive CORS, missing rate limiting

### Additional rules (retained from v1)

- Secrets as CLI arguments instead of env vars → **BLOCKER**
- Differentiated error responses revealing account existence → WARNING
- Timing side-channels on auth paths → WARNING
- SSRF: external URLs fetched without validation → **BLOCKER**
- Untrusted dynamic data overriding trusted static config via spread → WARNING
- No size limit on external file download streams → WARNING
- TOCTOU: `findFirst` + `update` instead of atomic operation → WARNING
- DB operations not scoped by tenant/provider → **BLOCKER**

### Phase 5 extensions (to be added)

Full OWASP Top 10:2025 mapping (A01-A10), including the 2025 new entries:
- **A03 Software Supply Chain Failures** (shared with 3d)
- **A10 Mishandling of Exceptional Conditions**

Plus modern CVE classes:
- JWT algorithm-confusion (CVE-2024-54150, CVE-2026-22817)
- NoSQL operator-pollution (CVE-2024-53900)
- GraphQL depth / alias / introspection
- CORS reflection
- Post-quantum crypto awareness (CNSA 2.0 — mandatory 2027-01-01)

See `data/owasp-top-10-2025.md` (Phase 5) for the full A01..A10 mapping table.

### Stack-specific grep scans (Phase 7 will split per-stack)

For TypeScript (placeholder — Phase 7 extracts to `data/stack-grep-bank/typescript.md`):

```bash
cd {worktree_path}
grep -rn "exec\|spawn\|execSync" --include="*.ts" {changed_files_dirs} | grep -v node_modules | grep -v "spec.ts"
grep -rn "queryRawUnsafe\|executeRawUnsafe" --include="*.ts" {changed_files_dirs}
grep -rn "password\|secret\|api_key\|apiKey\|token" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v ".d.ts"
```

Stack detection driven by the tech-stack-lookup protocol (`~/.claude/skills/bmad-shared/protocols/tech-stack-lookup.md`) field. Phase 7 dispatches per-stack grep banks.

Each finding carries `owasp: A01..A10` tag where applicable.

---

## SUB-AXIS 3b: AI / Agentic Safety

**Condition:** Conditional — activates when `CHANGED_FILES` imports `@anthropic-ai/sdk`, `openai`, `langchain`, `llamaindex`, `ai`, `@modelcontextprotocol/sdk`. Phase 3 stub; populated in Phase 5.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta3-3b-stub'
    severity: QUESTION
    action: defer
    meta: 3
    sub_axis: '3b'
    title: 'AI / Agentic Safety sub-axis not yet populated (Phase 5)'
    detail: 'OWASP LLM Top 10 (LLM01-10) + Agentic Top 10 (ASI01-10) mapping, indirect prompt injection defense, memory poisoning, excessive agency, tool trust-tier tagging land in Phase 5.'
    not_implemented: true
```

### Phase 5 target scope

- OWASP LLM Top 10:2025 + ASI01-10 (Agentic)
- Indirect prompt injection (dominant enterprise threat — Anthropic Feb 2026 system card)
- Memory poisoning (MINJA >95% injection rate)
- Excessive agency (Replit July 2025 incident: deleted prod DB)
- Tool trust-tier tagging
- System-prompt protection

Each finding carries `llm_risk: LLM01..LLM10` or `asi_risk: ASI01..ASI10` tag.

---

## SUB-AXIS 3c: Data Privacy

**Condition:** Conditional — activates when entities/schemas/migrations diff or logging-statement diffs detected. Phase 3 stub; populated in Phase 5.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta3-3c-stub'
    severity: QUESTION
    action: defer
    meta: 3
    sub_axis: '3c'
    title: 'Data Privacy sub-axis not yet populated (Phase 5)'
    detail: 'GDPR / EAA / AI Act Art. 26; PII detection in log statements + new fields; region pinning on storage; erasure-handler registry; consent gating land in Phase 5.'
    not_implemented: true
```

### Phase 5 target scope

- GDPR (cumulative €5.65B fines by 2025)
- EAA enforcement (since 2025-06-28, fines up to €3M)
- EU AI Act Article 26 (enforceable 2026-08, fines up to €35M or 7% global turnover)
- PII detection in log statements and new entity fields (regex bank + field-name heuristics)
- Region pinning on storage
- Erasure-handler registry
- Consent gating

New PII field without classification tag + erasure-registry entry → BLOCKER.

---

## SUB-AXIS 3d: Supply Chain

**Condition:** Conditional — activates when manifest/lockfile diffs detected (`package*.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `build.gradle*`). Phase 3 stub; populated in Phase 5.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta3-3d-stub'
    severity: QUESTION
    action: defer
    meta: 3
    sub_axis: '3d'
    title: 'Supply Chain sub-axis not yet populated (Phase 5)'
    detail: 'SLSA v1.0, SBOM (Syft CycloneDX + SPDX), typosquat edit-distance, minimumReleaseAge ≥ 3d, cosign signing, SHA-pinning GH Actions (policy Aug 2025), Renovate/Dependabot malware-vector mitigation, OpenSSF Malicious list land in Phase 5.'
    not_implemented: true
```

### Phase 5 target scope

- SLSA v1.0 provenance
- SBOM generation (Syft CycloneDX + SPDX)
- Typosquat detection (edit-distance < 2 from popular packages)
- `minimumReleaseAge ≥ 3d` — dep published < 14 days → WARNING
- Cosign signing verification
- SHA-pinning of GitHub Actions (GH policy since 2025-08) → unpinned = BLOCKER
- OpenSSF Malicious package list cross-reference
- Tooling: `osv-scanner`, `syft`, `grype`, `cosign verify`

Historical incidents informing this axis: xz-utils CVE-2024-3094, GhostAction Sep 2025 (3,325 tokens exfiltrated from 817 repos).

---

## OUTPUT FORMAT

Same schema as other metas, plus `group_id: 'S1'` or `'S2'` marking the voting instance. Each finding must carry `grep_based: true/false` (required by judge-triage voting rules — grep-based findings are unconditionally CONFIRMED).

```yaml
perspective_report:
  meta: 3
  group_id: 'S1'   # or 'S2'
  pov: 'attacker'  # or 'defender'
  sub_axes_executed: ['3a', '3b', '3c', '3d']

  findings:
    - id: 'F-M3-S1-001'
      severity: BLOCKER
      meta: 3
      sub_axis: '3a'
      owasp: 'A01'
      llm_risk: null          # set when sub_axis='3b'
      asi_risk: null
      file: 'apps/api/src/auth.controller.ts'
      line: 42
      title: 'JWT accepts alg=none'
      detail: '...'
      fix: '...'
      grep_based: false
      pattern_ref: 'apps/ref/auth.ts:15'

  scores:
    '3a': 0.75
    '3b': 1.0
    '3c': 1.0
    '3d': 1.0

  summary: {...}
```

DO NOT compute verdict — judge-triage applies voting consensus + consolidation.
