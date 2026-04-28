# External Research Template

Reference template for Step 6 external research (official docs, best practices, gotchas).

## Format

```markdown
### External Research

#### Official Documentation

| Source | URL | Version | Relevance |
| ------ | --- | ------- | --------- |
| {Provider API doc}    | {URL} | v3.2 | Endpoint contract |
| {Library doc}         | {URL} | 4.1.0 | Configuration options |
| {Protocol RFC}        | {URL} | RFC 7519 | JWT spec |

**Key findings:**
- {finding 1, citing source: doc-section / page}
- {finding 2, citing source}

#### Best Practices

| Topic | Source | Recommendation | Applicable to this story? |
| ----- | ------ | -------------- | ------------------------- |
| {Idempotency keys for refunds}    | {Stripe blog / IETF draft / Martin Fowler} | Use UUID per request, 24h dedup window | YES, applied in TAC-3 |
| {Cursor pagination > offset}      | {API design guide}                          | Cursor for high-cardinality lists       | NO, story uses offset by design |

#### Known Issues / Gotchas

| Source | Description | Impact on this story | Mitigation |
| ------ | ----------- | -------------------- | ---------- |
| {Library issue tracker / changelog / SO post} | {e.g. v4.1.0 breaks UTF-8 in headers} | We use this version | Pin to 4.1.1 (fixed) |
| {Provider known issue}                         | {e.g. Provider rate-limits at 100 RPS, undocumented} | Bulk migration could trip it | Add throttler |

#### Version Constraints

| Component | Current version | Target version | Reason |
| --------- | --------------- | -------------- | ------ |
| {library} | 4.0.5            | 4.1.1            | Bug fix + security patch |

#### Search Trail (transparency)

Searches executed (record query + 1-line summary of findings):
- `{query 1}` → {summary}
- `{query 2}` → {summary}
```

## Checklist

- [ ] Official docs cited for every external dependency (API, protocol, library)
- [ ] Doc versions match implementation versions
- [ ] At least one best-practice source consulted per major design decision
- [ ] Known issues / changelog / issue tracker scanned for the libraries used
- [ ] Version pinning rationale documented (why this version, not the latest)
- [ ] Search trail kept (which queries were run, even if they returned nothing useful)
- [ ] Findings explicitly linked to story decisions (which AC / TAC / risk this informs)

## Guidelines

**GOOD sources (in priority order):**
1. Official docs / RFC / standard body publications
2. Vendor changelogs and release notes
3. Vendor / open-source issue trackers
4. Authoritative engineering blogs (Stripe, Cloudflare, Google, AWS, Microsoft)
5. Security advisories (CVE, GHSA)

**BAD sources:**
- Random Stack Overflow answer with no upvotes
- Generic "10 best practices for X" listicle
- ChatGPT-generated content without primary source citation
- Outdated tutorials (>2 years old when version-sensitive)

## Anti-patterns

- "Docs are the same as last time, no need to re-check" → REJECT, breaking changes happen
- "Library is popular, must be fine" → REJECT, popular libraries have CVEs too
- Citing without URL → REJECT, traceability matters
- Best practice without applying it: list and ignore → REJECT, each row must say YES/NO with reason
