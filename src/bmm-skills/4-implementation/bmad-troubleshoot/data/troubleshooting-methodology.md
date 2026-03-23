# Troubleshooting Methodology

Structured diagnostic methods for bug investigation. Loaded by step-03-investigate and step-04-diagnose.

---

## 1. Log Reading Protocol

Follow this discipline when reading logs:

1. **Set the time window** — start from when the symptom was first observed, extend 15 minutes earlier
2. **Filter to affected service first** — do not read all services at once
3. **Severity order** — ERROR and FATAL first, then WARN
4. **Find the FIRST occurrence** — the first error is usually the cause, subsequent errors are symptoms
5. **Check for correlation IDs** — trace the failing request across service boundaries
6. **Check for ABSENCE** — if an expected log line is missing, that is signal (code path not reached, process crashed)
7. **Find the last SUCCESS before failure** — tells you exactly where execution stopped

## 2. Safe Database Investigation Rules

| Rule | Rationale |
|------|-----------|
| Always add `LIMIT` to queries | Prevent full table scans |
| Use `statement_timeout` if available | Prevent long-running queries |
| Never run `UPDATE`/`DELETE`/`INSERT` | Read-only investigation |
| Query by indexed columns | Avoid seq scans on large tables |
| Use the project's DB access skills | Never guess ports, credentials, or connection parameters |

**Common diagnostic queries:**
- Records around the incident timestamp
- Count of records in abnormal states (e.g., stuck "processing")
- Comparison of expected vs. actual data
- Foreign key integrity for inconsistent data

## 3. Divide and Conquer (Binary Search)

The most efficient method for narrowing down the cause:

1. **Identify the full pipeline** the request passes through (e.g., API → auth → controller → use case → repository → DB)
2. **Check the midpoint** — is the data correct at the midpoint?
3. **If correct at midpoint** → bug is in the second half
4. **If incorrect at midpoint** → bug is in the first half
5. **Repeat** — O(log n) steps instead of O(n)

## 4. Five Whys (Causal Chain)

Use when you found the proximate cause but need the systemic root cause:

```
Why did the API return 500? → DB query timed out
Why did the query time out? → Full table scan on 10M rows
Why was it doing a full scan? → Missing WHERE clause on indexed column
Why was WHERE clause missing? → ORM received undefined for tenant ID
Why was tenant ID undefined? → Auth middleware didn't extract it from new JWT format
```

**Root cause:** Missing JWT claim extraction migration.

Rules:
- Never identify a person as root cause — always a process, system, or automation gap
- Stop when you reach something fixable systemically
- If the chain branches (multiple causes), follow each branch

## 5. Kepner-Tregoe IS / IS-NOT

For isolating the cause by specifying what IS and IS NOT affected:

| Dimension | IS (affected) | IS NOT (affected) | Distinction |
|-----------|--------------|-------------------|-------------|
| **What** | {broken feature} | {working feature} | {difference} |
| **Where** | {affected env} | {unaffected env} | {difference} |
| **When** | {after timestamp} | {before timestamp} | {what changed} |
| **Extent** | {affected users} | {unaffected users} | {difference} |

The "distinction" column narrows the search: what is unique about the affected group?

## 6. Git Bisect (for regressions)

When the bug was introduced between two known commits:

```bash
git bisect start
git bisect bad HEAD
git bisect good {LAST_KNOWN_GOOD_COMMIT}
# Test at each midpoint → git bisect good/bad
# ~log2(n) steps to find the culprit
```

## 7. Deployment Correlation

Quick check to determine if this is a regression:

1. When did the symptom first appear?
2. Was there a deploy within the preceding window?
3. What changed in that deploy? (`git log --oneline {prev_tag}..{current_tag}`)
4. Do the changed files correlate with the affected feature?

If yes to all → the fastest fix is often rollback, not debugging.
