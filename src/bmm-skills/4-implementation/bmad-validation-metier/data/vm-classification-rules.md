# VM Item Classification Rules

Classify each Validation Metier item into ONE type based on what proof is needed.

## Types

### `api` — Testable via API call

The VM describes an action or verification achievable via an HTTP endpoint.

**Signals:**
- "Call the endpoint...", "Verify the response of..."
- "The endpoint returns...", "The API responds..."
- Mentions an endpoint, a payload, an HTTP status code

**Action:** execute the HTTP request (curl), capture the full response as proof.

### `db` — Verifiable via SQL query

The VM describes a database state to verify.

**Signals:**
- "Verify in the database that...", "The transaction is recorded..."
- "The status changes to...", "The field X contains..."
- "Data is saved...", "Row exists...", "Value is updated..."
- Mentions a table, a field, a record

**Action:** execute the SQL query via the project's DB access method, capture the result as proof.

### `front` — Requires visual validation by the user

The VM describes a behavior visible in the user interface.

**Signals:**
- "The user sees...", "The page displays..."
- "The button...", "The form..."
- Mentions a front-end URL, a UI component, a user interaction

**Action:** read the front-end code to prepare instructions, HALT for screenshot, critically evaluate the result.

### `cloud_log` — Verifiable via cloud platform logs/traces

The VM mentions logs, traces, or async events.

**Signals:**
- "Verify in the logs that...", "The message is published..."
- "The trace shows...", "The event is emitted..."
- "The job runs...", "The trigger fires..."

**Action:** query the cloud platform CLI (log read, trace list, etc.), capture the result as proof.

### `mixed` — Combination of types

The VM requires multiple types of verification.

**Example:** "Place an order and verify that the provider receives the data" = `api` (place order) + `api` or `db` (verify receipt).

**Action:** decompose into typed sub-steps, execute each with its type.

## Classification Summary

| Type | When to use | Proof method |
|------|------------|-------------|
| api | Item verifies an API endpoint response, status code, or payload | HTTP request (curl) |
| db | Item verifies data was persisted, updated, or computed correctly in DB | SQL query |
| front | Item verifies UI rendering, user-facing behavior, or visual display | Screenshot from user |
| cloud_log | Item verifies background processing, async events, or scheduled jobs | Cloud platform log query |
| mixed | Item requires multiple proof types (e.g., API call + DB verification) | Combination |

## Default rule

If a VM does not clearly match any single type, classify as `mixed` and decompose.

## Write actions in production

Regardless of type, if the action involves a write in production:
1. Explicitly flag it to the user
2. Wait for authorization
3. Document the authorization in the report
