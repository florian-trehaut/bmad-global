# Step 3: Assess Performance, Reliability, Maintainability, Observability, Testability

## STEP GOAL

Scan the codebase for performance, reliability, maintainability, observability, and testability patterns. Score each dimension with evidence. This covers all NFR dimensions except security (assessed in step 2).

## RULES

- Same evidence and scoring rules as step 2: every finding needs file path evidence, score as PASS/CONCERNS/FAIL.
- This step covers five dimensions — execute all five sequentially.
- For epic-level scope, focus on relevant services. For system-level, scan all non-legacy services.

## SEQUENCE

### 1. Assess performance

Scan for performance patterns:

**Database queries:**
- Grep for N+1 patterns: nested `.findMany()` inside loops, missing `include`/`with` for related data
- Grep for unbounded queries: `findMany()` without `take`/`limit`, missing pagination
- Check for database indexes: read migration files for `CREATE INDEX` statements
- Grep for `$queryRaw` with potentially expensive operations

**Caching:**
- Grep for cache decorators, `CacheModule`, `@CacheKey`, Redis/cache imports
- Identify endpoints that serve frequently-accessed data without caching
- Check for cache invalidation patterns

**Async patterns:**
- Grep for `Promise.all` vs sequential awaits in loops (`for...of` with `await` inside)
- Grep for Cloud Tasks / queue-based processing for heavy operations
- Check for blocking operations in request handlers

**Payload sizes:**
- Grep for response pagination patterns (`skip`, `take`, `cursor`)
- Check Cloud Tasks payloads (should be < 1MB — reference URLs, not full data)
- Grep for `select` clauses limiting returned fields

**Connection pooling:**
- Check Prisma connection pool configuration (`connection_limit`, `pool_timeout`)
- Check for PgBouncer or similar pooling configuration

Compile:
```yaml
performance_assessment:
  database: { status, evidence, gaps }
  caching: { status, evidence, gaps }
  async_patterns: { status, evidence, gaps }
  payload_management: { status, evidence, gaps }
  overall: PASS | CONCERNS | FAIL
```

### 2. Assess reliability

Scan for reliability patterns:

**Error handling:**
- Grep for custom exception filters (`@Catch`, `ExceptionFilter`)
- Grep for domain error classes (extending `Error` or custom base)
- Check for unhandled promise rejections, missing `.catch()` on promises
- Verify error responses use structured format (not raw stack traces)

**Retry and resilience:**
- Grep for retry logic: `retry`, `backoff`, Cloud Tasks retry config
- Check for idempotency keys or idempotent handler patterns
- Grep for circuit breaker patterns
- Check for graceful shutdown handling (`onModuleDestroy`, `beforeApplicationShutdown`)

**Transaction management:**
- Grep for `$transaction`, `db.transaction` — verify multi-step operations use transactions
- Check for rollback handling on transaction failure
- Look for operations that modify multiple tables without transactions

**Health checks:**
- Grep for `@nestjs/terminus`, `HealthController`, readiness/liveness endpoints
- Verify health checks include database connectivity
- Check for dependency health checks (external services)

Compile:
```yaml
reliability_assessment:
  error_handling: { status, evidence, gaps }
  retry_resilience: { status, evidence, gaps }
  transactions: { status, evidence, gaps }
  health_checks: { status, evidence, gaps }
  overall: PASS | CONCERNS | FAIL
```

### 3. Assess maintainability

Scan for maintainability patterns:

**Architecture adherence:**
- Verify hexagonal architecture: check for `domain/ports/`, `infrastructure/`, `api/` separation
- Check for domain logic leaking into controllers or infrastructure
- Grep for direct ORM calls in domain layer (violation of ports/adapters)

**Code quality:**
- Grep for `any` type usage (excluding justified cases)
- Grep for `@ts-ignore` or `@ts-expect-error`
- Check TypeScript strict mode in `tsconfig.json` files
- Grep for `console.log` in production code (should use NestJS Logger)
- Check for dead code: unused exports, commented-out blocks

**Test coverage:**
- Count test files by type: `*.spec.ts`, `*.integration.spec.ts`, `*.journey.yaml`
- Check for InMemory fakes in `domain/testing/` (proper test doubles)
- Identify services or modules with no tests
- Check test pyramid balance (unit > integration > journey)

**Dependency health:**
- Check `package.json` for significantly outdated major versions
- Look for deprecated packages

Compile:
```yaml
maintainability_assessment:
  architecture: { status, evidence, gaps }
  code_quality: { status, evidence, gaps }
  test_coverage: { status, evidence, gaps }
  dependency_health: { status, evidence, gaps }
  overall: PASS | CONCERNS | FAIL
```

### 4. Assess observability

Scan for observability patterns:

**Structured logging:**
- Grep for NestJS `Logger` usage across services
- Check for structured log format (JSON logging in production)
- Verify log levels are used appropriately (debug/info/warn/error)

**Tracing:**
- Grep for `@rewardpulse/tracing`, OpenTelemetry, trace context propagation
- Check for trace ID in HTTP headers and log entries
- Verify cross-service trace propagation

**Alerting:**
- Grep for `@rewardpulse/alerting`, Slack alert integration
- Check that critical error paths trigger alerts (not just logs)
- Verify switch/case defaults throw or alert (per project rules)

**Metrics:**
- Grep for custom metrics, Prometheus, metric collection
- Check for business-relevant metrics (order counts, failure rates)

Compile:
```yaml
observability_assessment:
  logging: { status, evidence, gaps }
  tracing: { status, evidence, gaps }
  alerting: { status, evidence, gaps }
  metrics: { status, evidence, gaps }
  overall: PASS | CONCERNS | FAIL
```

### 5. Assess testability

Scan for testability patterns — this evaluates how well the codebase supports automated testing:

**Mock seams clarity:**
- Check for dependency injection patterns (constructor injection, DI containers)
- Grep for interface/port definitions that allow swapping real implementations with test doubles
- Verify external service calls go through adapter/gateway abstractions (not direct HTTP calls in business logic)
- Check for InMemory implementations of ports/repositories in test directories

**Dependency injection readiness:**
- Grep for `@Injectable`, `@Inject`, provider registration patterns
- Verify modules declare providers through DI (not hard-coded `new` in business logic)
- Check that configuration is injectable (not `process.env` reads scattered in code)
- Look for factory patterns that support test data generation

**Test infrastructure:**
- Check for test factories / fixtures / seed utilities
- Grep for shared test helpers, custom matchers, assertion utilities
- Verify test data cleanup mechanisms (teardown, transaction rollback)
- Check for parallel-safe test data (unique identifiers, no shared state)

**Testability index scoring:**

Score testability on a 1-5 scale for each sub-dimension:

| Sub-dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|--------------|----------|--------------|---------------|
| Mock seams | No interfaces, direct deps | Some interfaces, partial DI | Full ports/adapters with InMemory fakes |
| DI readiness | Hard-coded `new`, `process.env` | Partial DI, some config injection | Full DI, all config injectable |
| Test infra | No factories, manual setup | Basic factories, some helpers | Full factory suite, parallel-safe, auto-cleanup |
| Isolation | Shared state, order-dependent | Mostly isolated, some coupling | Fully isolated, parallel-safe |

**Testability Index** = average of sub-dimension scores (1.0-5.0)
- >= 4.0: PASS
- 2.5-3.9: CONCERNS
- < 2.5: FAIL

Compile:
```yaml
testability_assessment:
  mock_seams: { status, score_1_5, evidence, gaps }
  di_readiness: { status, score_1_5, evidence, gaps }
  test_infrastructure: { status, score_1_5, evidence, gaps }
  isolation: { status, score_1_5, evidence, gaps }
  testability_index: { score, status }
  overall: PASS | CONCERNS | FAIL
```

### 6. Store all assessments

Store the five compiled assessments (performance, reliability, maintainability, observability, testability) alongside the security assessment from step 2. All six dimension assessments are inputs to step 4.

---

**Next:** Read fully and follow `./step-04-synthesize.md`
