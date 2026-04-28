# Step 2: Assess Security NFRs


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-02-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-02-ENTRY PASSED — entering Step 2: Assess Security NFRs with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Scan the codebase within the determined perimeter for security patterns and anti-patterns. Score each security sub-dimension with evidence. This step focuses exclusively on security — other NFR dimensions are assessed in step 3.

## RULES

- Every finding MUST include file path evidence (from Grep/Glob/Read results).
- Score each sub-dimension as `PASS`, `CONCERNS`, or `FAIL`.
- `PASS` = pattern is consistently applied, no significant gaps found.
- `CONCERNS` = pattern exists but has gaps or inconsistencies.
- `FAIL` = pattern is missing or fundamentally broken.
- For epic-level scope, focus scanning on the relevant services only.
- For system-level scope, scan across all non-legacy services.

## SEQUENCE

### 1. Assess authentication

Scan for authentication patterns:

- **Guards/middleware:** Grep for `@UseGuards`, `AuthGuard`, `JwtAuthGuard`, custom auth decorators
- **Token validation:** Grep for JWT verification, token parsing, OIDC patterns
- **Public endpoints:** Grep for `@Public()` or `@SkipAuth()` decorators — verify they are intentional
- **API key protection:** Grep for API key validation on internal service-to-service calls

Record: which services have auth guards, which endpoints are unprotected, any auth bypass patterns.

### 2. Assess authorization

Scan for authorization patterns:

- **RBAC/permissions:** Grep for role checks, permission decorators, `@Roles()`, policy guards
- **Resource ownership:** Grep for ownership checks (user ID matching, tenant isolation)
- **Admin-only routes:** Verify admin endpoints have proper guards

Record: authorization model used, gaps in permission checks.

### 3. Assess input validation

Scan for input validation patterns:

- **DTOs with class-validator:** Grep for `@IsString()`, `@IsEmail()`, `@IsNotEmpty()`, `class-validator` imports
- **ValidationPipe:** Grep for `ValidationPipe` usage (global or per-controller)
- **Transform/whitelist:** Check if `transform: true` and `whitelist: true` are set
- **Missing validation:** Grep for `@Body()` without DTO types, raw `req.body` access

Record: validation coverage, services missing validation pipes.

### 4. Assess data protection

Scan for data protection patterns:

- **Secrets management:** Grep for hardcoded secrets, API keys in source code, `.env` patterns
- **PII handling:** Grep for email, phone, address fields — check if logged or exposed
- **Encryption:** Grep for `bcrypt`, `crypto`, hashing functions
- **Sensitive data in logs:** Grep for `Logger` calls that might log tokens, passwords, or PII

Record: secrets management approach, PII exposure risks.

### 5. Assess injection prevention

Scan for injection vulnerabilities:

- **Parameterized queries:** Verify Prisma/Drizzle usage (inherently parameterized) vs raw SQL
- **Raw SQL:** Grep for `$queryRaw`, `$executeRaw`, `sql.raw`, `db.execute` with string concatenation
- **Template injection:** Grep for string interpolation in SQL, HTML, or shell commands
- **No-SQL injection:** Check for unvalidated user input in query filters

Record: query safety patterns, any raw SQL with concatenation.

### 6. Assess CORS and transport security

Scan for transport security:

- **CORS config:** Grep for `enableCors`, `cors`, `@nestjs/common` CORS setup — check allowed origins
- **Helmet:** Grep for `helmet` middleware
- **Rate limiting:** Grep for `@Throttle`, `ThrottlerModule`, rate limit configuration
- **HTTPS enforcement:** Check for HSTS headers, secure cookie flags

Record: CORS policy, missing security headers.

### 7. Compile security assessment

Compile findings into a structured assessment:

```yaml
security_assessment:
  authentication:
    status: PASS | CONCERNS | FAIL
    evidence: 'summary of findings with key file paths'
    gaps: ['list of gaps']
  authorization:
    status: PASS | CONCERNS | FAIL
    evidence: '...'
    gaps: []
  input_validation:
    status: PASS | CONCERNS | FAIL
    evidence: '...'
    gaps: []
  data_protection:
    status: PASS | CONCERNS | FAIL
    evidence: '...'
    gaps: []
  injection_prevention:
    status: PASS | CONCERNS | FAIL
    evidence: '...'
    gaps: []
  transport_security:
    status: PASS | CONCERNS | FAIL
    evidence: '...'
    gaps: []
  overall: PASS | CONCERNS | FAIL
```

**Overall security status:**
- `PASS` = all sub-dimensions PASS
- `CONCERNS` = no FAIL, at least one CONCERNS
- `FAIL` = at least one sub-dimension FAIL

Store this assessment for step 4.

---

## STEP EXIT (CHK-STEP-02-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-02-EXIT PASSED — completed Step 2: Assess Security NFRs
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-03-assess-other.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
