# Proof Standards

## Principle

**Only valid proof = result of a real action on the target environment.**

Proof is an artifact captured DURING the execution of the validation, not a priori reasoning.

## Valid Proof Types

### API Response
```
Proof: HTTP {METHOD} {URL}
Status: {status_code}
Body: {response_body (relevant extract)}
Timestamp: {datetime}
```

### DB Query Result
```
Proof: SQL Query
Query: {sql_query}
Result: {rows (relevant extract)}
Database: {db_name}
Timestamp: {datetime}
```

### Screenshot (front-end)
```
Proof: User screenshot
URL: {page_url}
Action: {what the user did}
Visible result: {description of what is seen}
Conforming: {yes/no + justification}
```

### Cloud Platform Log/Trace
```
Proof: Cloud platform {log_type}
Query: {cli_command}
Result: {relevant log/trace extract}
Timestamp: {datetime}
```

### File/Object Storage Check
```
Proof: Object storage CLI
Command: {cli_command} (e.g., gsutil ls, aws s3 ls, etc.)
Result: {file found / relevant content}
Timestamp: {datetime}
```

## Valid Proof Summary

| Proof type | Description | Example |
|-----------|-------------|---------|
| api_response | Full HTTP response (status code + body) from a real endpoint | `curl -s https://api.example.com/health` |
| db_query_result | SQL query output from a real database | `SELECT * FROM orders WHERE id = 123;` |
| screenshot | Browser screenshot showing UI state | User-provided screenshot of the page |
| cloud_log | Log entry from cloud platform (Cloud Run, Lambda, ECS, etc.) | Structured log showing event processing |
| file_check | Verification that a file exists with expected content | Object storage listing or content check |

## Invalid Proof Types (systematic rejection)

These are NEVER acceptable as proof, regardless of how convincing they seem:

| Invalid proof | Why it is rejected |
|--------------|-------------------|
| "I read the code and it does X" | Code can have bugs not visible from reading |
| "The unit test passes" | Unit tests use fakes, not the real environment |
| "Logically, it should work" | Reasoning does not replace observation |
| "The code hasn't changed since last time" | The environment may have changed |
| "The CI pipeline is green" | CI tests code, not real environment behavior |
| Running code locally | Local execution proves nothing about deployed behavior |
| "HTTP 201 means the email was sent" | An API returning success means the request was accepted, NOT that the side-effect (email, event, webhook) occurred. Verify the downstream system. |
| "Inspecting compiled HTML attributes" | Reading the HTML output of a template is code analysis, not business validation |

### Email-Specific Rules

**An API call that triggers an email is NOT proof of email delivery.** The API may succeed while the email fails silently (wrong payload, missing fields, provider error, suppressed recipient).

To prove an email was sent:
1. **Verify in the email provider** (e.g., Resend API `GET /emails`) that the email exists and has `last_event: delivered`
2. **Or verify in Cloud Run logs** that the email service processed and sent the message
3. **And** obtain user confirmation of receipt for visual rendering VMs

## The Cardinal Rule

**If you cannot demonstrate it with a real environment response, it is NOT validated.**

Code analysis can inform WHAT to test, but it can never BE the test.

## Rules

1. Each VM MUST have at least one valid proof
2. A VM without proof = **automatic FAIL**
3. A VM with only invalid proofs = **automatic FAIL**
4. In case of doubt about the validity of a proof, consider it invalid
5. **ONE non-conforming result = immediate FAIL** — NEVER retest with other data, NEVER look for an explanation, NEVER rationalize the divergence. The first test is authoritative.
