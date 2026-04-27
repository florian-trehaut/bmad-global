# {Project Name} — API Surface

<!-- Template for bmad-knowledge-bootstrap. Routes, endpoints, schemas, integration points. Derived primarily from architecture.md §"API Design", route files, OpenAPI specs, epics. -->

<!-- Generated from {sources_used}. Manual edits supported but flagged on next refresh.
     To change API surface: edit architecture.md / specs / route files and re-run /bmad-knowledge-refresh. -->

## API Style

<!-- REST, GraphQL, gRPC, CLI commands, file-based? Detected from route definitions, schema files, controller patterns. -->

## Endpoints

<!-- Key endpoints/routes grouped by domain. Table: Method | Path | Purpose | Auth. Detected from route definitions, controller files, OpenAPI specs. -->

### {Domain Group 1}

| Method | Path | Purpose | Auth Required |
|---|---|---|---|
| {GET/POST/...} | {/api/v1/...} | {description} | {yes/no/role} |

## Request/Response Schemas

<!-- Key DTOs, request/response shapes. Detected from DTO classes, validation decorators, type definitions. -->

### {Schema Name}

```
{Key fields and types — not exhaustive, focus on business-critical fields}
```

## Authentication

<!-- Auth mechanism: JWT, session, API key, OAuth. Detected from auth middleware, guard implementations. -->

## Error Handling

<!-- Error response format, error codes, exception hierarchy. Detected from exception filters, error handlers. -->

## Rate Limiting

<!-- Rate limiting configuration if present. -->

## Versioning

<!-- API versioning strategy: URL path, header, query param. -->

## Integration Points

<!-- External APIs consumed by this project. Table: Service | Base URL Config | Purpose. -->

| Service | Config Key | Purpose |
|---|---|---|
| {e.g., payment gateway} | {e.g., PAYMENT_API_URL} | {what it's used for} |
