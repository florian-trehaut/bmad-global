# Real-Data Findings Template

Reference template for Step 5 real-data investigation findings.

## Cardinal Rule

**Code analysis is NEVER a substitute for real data.** Reading parser code tells you what code EXPECTS. It does NOT tell you what the provider / DB / cloud system ACTUALLY produces.

## Format

````markdown
### Real-Data Findings

**Sources investigated:**

| Source | Type | Access Method | Sample Size | Date |
| ------ | ---- | ------------- | ----------- | ---- |
| {Provider X SFTP} | provider     | {project's provider access skill} | {N records}        | YYYY-MM-DD |
| {Staging DB - orders table} | database     | {project's DB access skill}       | {N rows}           | YYYY-MM-DD |
| {Cloud platform logs - service Y} | cloud_logs   | {gcloud / aws / azure CLI / MCP}  | {N entries / time range} | YYYY-MM-DD |

#### Provider Findings — {Provider X}

**Actual format observed:**

```{json|csv|xml}
{paste real sample, anonymized if needed}
```

**Field-level observations:**

| Field | Type observed | Nullable observed? | Spec says | Reality matches spec? |
| ----- | ------------- | ------------------ | --------- | --------------------- |
| {currency} | string (3 chars) | yes (5% of records) | non-null required | NO — risk of NULL |
| {amount}   | decimal           | no                  | required          | YES |

**Edge cases observed:**
- {description, file/timestamp where it occurred}
- {description, file/timestamp where it occurred}

#### Database Findings — {table_name}

**Schema vs actual data:**

```sql
-- Query executed:
SELECT col_a, col_b, COUNT(*) FROM table WHERE ... GROUP BY col_a, col_b;

-- Result: paste relevant rows
```

**Field-level observations:**

| Column | Schema says | Actual values | Notes |
| ------ | ----------- | ------------- | ----- |
| {status} | enum(NEW, OK, KO) | NEW, OK, KO, **PENDING** | Undocumented value found in 12% of rows |

**Volume:**
- Total rows: {N}
- Rows in scope of this story: {N or %}
- Growth rate: {N/day/week/month}

#### Cloud Log Findings — {service Y}

**Time range:** {from / to}
**Filter applied:** `{log query}`

**Patterns observed:**
- {error pattern}: {N occurrences in window}
- {warn pattern}: {N occurrences in window}

**Sample log lines:**

```
{paste anonymized log lines}
```

#### Comparison: Spec Assumptions vs Reality

| # | Story assumption | Reality | Verdict |
| - | ---------------- | ------- | ------- |
| 1 | {Provider always sends UTC} | Confirmed (real samples checked) | VERIFIED |
| 2 | {refund.currency is always non-null} | NULL in 5% of records | INVALIDATED — must add validation + alert |
| 3 | {orders.status is enum(NEW,OK,KO)} | Also `PENDING` in 12% of rows | INVALIDATED — schema drift, requires migration or expanded enum |
````

## Checklist

- [ ] Every claimed data dependency in the story is backed by real-data evidence
- [ ] Provider data investigated (real samples), not just parser code
- [ ] DB data queried (staging or prod, with read-only credentials)
- [ ] Cloud logs scanned for the relevant service
- [ ] Edge cases observed and documented
- [ ] Volume figures captured (count + growth)
- [ ] Schema-vs-reality drift detected and flagged
- [ ] Spec assumptions table comparing CODE EXPECTS vs REALITY SENDS
- [ ] INVALIDATED assumptions trigger story updates (not silent acceptance)

## Guidelines

**Valid evidence:**
- Real provider files (anonymized) committed to story artifacts
- Actual SQL query + result rows
- Actual log lines from cloud platform
- Real metric query result (Prometheus / CloudWatch / Stackdriver)

**Invalid evidence:**
- "I read the parser, it expects X" → NOT data, that's code
- "The schema file says Y" → NOT data, that's intent
- "The doc says Z" → NOT data, that's documentation (use external-research-template for docs)
- "I tested locally with mock data" → NOT real data

## Anti-patterns

- Skipping provider investigation because "the parser handles it" → REJECT, the parser doesn't tell you what the provider sends
- Querying ONLY local dev DB → REJECT, dev is not staging is not prod
- Trusting schema files over real data → REJECT, schema drift is the rule, not the exception
- Cloud log query that returns 0 results: "looks fine" → REJECT, verify the query is correct first
