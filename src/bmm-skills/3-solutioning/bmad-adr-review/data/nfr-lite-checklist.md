# NFR Lite Checklist

Lightweight NFR readiness scan for ADR reviews. Loaded by step-05-nfr-scan.md.

Source: Derived from `bmad-test-design/data/knowledge/adr-quality-readiness-checklist.md` (8 categories, 29 criteria). This is a **selective subset** — use `bmad-nfr-assess` for comprehensive evaluation.

---

## Auto-Selection Logic

Based on the ADR's topic, select ONLY the relevant NFR categories. Do NOT scan all 8 categories — that is the job of bmad-nfr-assess.

| ADR Topic | Categories to Scan |
|-----------|-------------------|
| **New service / microservice** | Testability, Security, Monitorability, Deployability |
| **Data pipeline / ETL** | Test Data Strategy, Scalability, Monitorability |
| **Technology migration** | Testability, Deployability, Scalability |
| **Authentication / authorization** | Security, Testability |
| **API design / integration** | Testability, Security, QoS |
| **Database / storage** | Scalability, Disaster Recovery, Security |
| **Frontend / UI** | Testability, QoS/QoE |
| **Infrastructure / cloud** | Scalability, Disaster Recovery, Deployability, Security |
| **Performance optimization** | QoS, Scalability, Monitorability |
| **General / uncategorized** | Testability, Security (minimum baseline) |

---

## Scan Criteria (by category)

For each selected category, check the ADR against these criteria. Mark: ADDRESSED / GAP / NOT_APPLICABLE.

### 1. Testability & Automation

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 1.1 | Isolation | Can the proposed solution be tested with dependencies mocked/stubbed? |
| 1.2 | Headless interaction | Is business logic accessible via API (not UI-coupled)? |
| 1.3 | State control | Are seeding/setup mechanisms considered for testing? |
| 1.4 | Sample requests | Are example API calls or interactions provided? |

### 2. Test Data Strategy

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 2.1 | Segregation | Is test data isolation addressed (multi-tenancy, test headers)? |
| 2.2 | Generation | Is synthetic data generation considered (vs. production data)? |
| 2.3 | Teardown | Is cleanup after tests addressed? |

### 3. Scalability & Availability

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 3.1 | Statelessness | Is the proposed solution stateless? If not, how is state managed? |
| 3.2 | Bottlenecks | Are potential bottlenecks identified under load? |
| 3.3 | SLA definitions | Are availability targets defined? |
| 3.4 | Circuit breakers | Is failure isolation addressed (fail fast vs. cascading)? |

### 4. Disaster Recovery

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 4.1 | RTO/RPO | Are recovery objectives defined? |
| 4.2 | Failover | Is failover strategy addressed? |
| 4.3 | Backups | Is backup and restore considered? |

### 5. Security

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 5.1 | AuthN/AuthZ | Are authentication and authorization addressed? |
| 5.2 | Encryption | Is data encryption (at rest and in transit) considered? |
| 5.3 | Secrets | Is secrets management addressed? |
| 5.4 | Input validation | Is input sanitization considered? |

### 6. Monitorability, Debuggability & Manageability

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 6.1 | Tracing | Is distributed tracing or correlation IDs addressed? |
| 6.2 | Logs | Is logging strategy considered? |
| 6.3 | Metrics | Are operational metrics defined? |
| 6.4 | Config | Is configuration externalized? |

### 7. QoS & QoE

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 7.1 | Latency | Are performance targets defined? |
| 7.2 | Throttling | Is rate limiting addressed? |
| 7.3 | Perceived performance | Is user experience during loading addressed? |
| 7.4 | Degradation | Is graceful degradation considered? |

### 8. Deployability

| # | Criterion | What to check in the ADR |
|---|-----------|-------------------------|
| 8.1 | Zero downtime | Is deployment strategy addressed (blue/green, canary)? |
| 8.2 | Backward compatibility | Are migration and compatibility addressed? |
| 8.3 | Rollback | Is rollback strategy defined? |

---

## Output Format

Present results as a focused table for selected categories only:

```markdown
### NFR Readiness Scan

**Categories scanned:** {list based on ADR topic}

| Category | Criteria Checked | Gaps | Key Gap |
|----------|-----------------|------|---------|
| {name} | {N}/{total} | {gap_count} | {most significant gap} |

**Detailed gaps:**

- [{category}] {criterion}: {what the ADR does not address}
```

Generate NFR_READINESS findings only for gaps with direct relevance to the ADR decision. Include a pointer: "For comprehensive NFR evaluation, use `bmad-nfr-assess`."
