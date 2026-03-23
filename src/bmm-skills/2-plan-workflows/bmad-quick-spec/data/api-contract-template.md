# API Contract Template

Reference template for Step 4 API contract assessment.

## Format

```markdown
### API Contracts

| Method | Endpoint | Request Body | Response | Error Codes | Auth |
| ------ | -------- | ------------ | -------- | ----------- | ---- |

**Detailed payload (per new/modified endpoint):**

#### POST /api/v1/example

Request:

```json
{ "field": "type", ... }
```

Response 200:

```json
{ "id": "uuid", ... }
```

Errors: 400 (validation), 401 (unauthorized), 409 (conflict), 500
```

## Checklist

- [ ] Existing impacted endpoints identified (read controllers in the worktree)
- [ ] New endpoints defined with method, path, auth
- [ ] Request/response payloads detailed
- [ ] Error codes documented
- [ ] Guards and validation DTO specified
