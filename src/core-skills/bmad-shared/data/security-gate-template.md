# Security Gate Template

Reference template for Step 9 security & compliance gate (binary verdict).

## Format

```markdown
### Security Gate

**Verdict:** PASS | FAIL | N/A *(N/A requires per-item justification)*

| Item | Question | Verdict | Evidence / Mitigation |
| ---- | -------- | ------- | --------------------- |
| Authentication       | Does this story expose endpoints/data that require user authentication? Is auth wired correctly? | PASS / FAIL / N/A | {file:line, auth middleware, exemption reason} |
| Authorization        | Does this story enforce role/permission checks? Is privilege escalation prevented?                  | PASS / FAIL / N/A | {policy, RBAC config, ABAC rule} |
| Data Exposure        | Does the response leak sensitive data (PII, secrets, internal IDs)?                                 | PASS / FAIL / N/A | {field allowlist, serializer, redaction} |
| Input Sanitization   | Are user inputs validated and sanitized? (SQL injection, XSS, command injection, path traversal)    | PASS / FAIL / N/A | {validator, parameterized query, encoding} |
| Secrets Handling     | Are credentials, API keys, tokens loaded from secret manager (not env vars committed in repo)?      | PASS / FAIL / N/A | {secret manager ref, IAM binding} |
| Audit Trail          | Are sensitive operations logged with actor, action, target, timestamp?                              | PASS / FAIL / N/A | {audit logger, log fields} |
| Compliance — GDPR    | Does this touch PII / DSAR / right-to-erasure / data residency?                                     | PASS / FAIL / N/A | {DPIA, retention policy, processor agreement} |
| Compliance — HIPAA   | Does this touch PHI / BAA-required data?                                                             | PASS / FAIL / N/A | {BAA confirmation, encryption at rest/transit} |
| Compliance — SOC2    | Does this affect controlled processes (access control, change management, incident response)?      | PASS / FAIL / N/A | {control mapping, evidence} |
| Compliance — PCI-DSS | Does this touch cardholder data?                                                                     | PASS / FAIL / N/A | {scope confirmation, tokenization} |
| Compliance — Other   | Project-specific compliance (SOX, ISO 27001, NIS2, ...)                                              | PASS / FAIL / N/A | {control reference} |

**Binary rule:** ANY item marked FAIL → security gate fails → BLOCKING for production. Add remediation tasks to Implementation Plan.

**Project security baseline:** see `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md#security-baseline` (if defined).
```

## Checklist

- [ ] Every item has a verdict (no blanks)
- [ ] FAIL items have remediation tasks added
- [ ] N/A items have a 1-line justification
- [ ] Compliance scope verified (which standards apply to this product/region)
- [ ] Project security baseline cross-referenced
- [ ] Verdict is BINARY (any FAIL → gate FAILS, no "PARTIAL" or "PASS with caveats")

## Guidelines

**Reject these qualifications:**
- "PASS with minor concerns" → FAIL or PASS, no middle ground
- "PARTIAL" → FAIL until fully PASS
- "Will fix in next story" → FAIL until tasks added in THIS story
- "Not in scope" without explicit user confirmation → FAIL

**Accept N/A only if:**
- Story does not touch the relevant attack surface (e.g. internal-only batch script with no user input)
- Project explicitly delegates to platform layer with documented mitigations

## Anti-patterns

- Skipping items without N/A justification → REJECT
- Treating "we use HTTPS" as Security gate PASS → REJECT (HTTPS is one mitigation, not the gate)
- Accepting FAIL → not BLOCKING because "the existing system is also FAIL" → REJECT (this story does not make it worse, but it cannot make it pass either; flag the global gap separately)
