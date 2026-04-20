# OWASP Top 10:2025 — Mapping Reference

**Consumed by:** sub-axis 3a (Security). Every security finding MUST carry an `owasp: AXX` tag that maps to one of the categories below, unless the finding is explicitly out-of-catalogue (and that exception documented in the finding's `detail`).

Reference: <https://owasp.org/Top10/> (2025 edition).

---

## Categories

### A01 — Broken Access Control

Authorisation logic bypass, privilege escalation, horizontal / vertical access control failures.

**Grep signals (stack-agnostic):**
- Missing authorisation decorators on routes
- IDOR: `findById(userInput)` without ownership check
- Hardcoded admin bypass
- JWT without signature verification

**Severity:** Always BLOCKER when exploitable; WARNING for theoretical issues with mitigating controls.

### A02 — Cryptographic Failures

Weak algorithms, missing encryption at rest/in transit, poor key management.

**Grep signals:**
- `md5`, `sha1` for password hashing
- `Math.random()` or equivalent for security tokens
- TLS disabled / self-signed certs accepted in production code
- API keys / secrets hardcoded in source
- **JWT algorithm confusion** (CVE-2024-54150, CVE-2026-22817): `alg=none`, `alg=HS256` with RSA public key → BLOCKER
- **Post-quantum awareness (CNSA 2.0, mandatory 2027-01-01):** New crypto code using RSA-2048 / ECDSA-P256 without migration plan → WARNING

### A03 — Injection (was "Software Supply Chain Failures" in draft; renumbered in final 2025)

SQL, NoSQL, command, LDAP, XPath, SSRF, XSS, template injection.

**New 2025 CVE classes:**
- **NoSQL operator-pollution** (CVE-2024-53900): MongoDB queries accepting user-supplied `$where`, `$function`, or operator-injection in query objects → BLOCKER
- **GraphQL introspection exposure** in production → WARNING
- **GraphQL depth / alias amplification** without limits → BLOCKER on public endpoints
- **Template injection** via unescaped user input in template engines (Jinja2, Handlebars, etc.)

**Grep signals:**
- `queryRawUnsafe`, `raw`, `eval`, `exec`, `spawn`, `fetch(` with user-controlled URL
- Template engines with `raw` / `safe` modifiers on user content

### A04 — Insecure Design

Threat modelling gaps, missing rate limiting, missing CSRF, missing security headers.

**Grep signals:**
- Missing `@Throttle` / rate-limit middleware on auth endpoints
- CORS: `origin: '*'` with `credentials: true` (reflection attack)
- Missing security headers (HSTS, CSP, X-Frame-Options)
- Missing CSRF tokens on state-changing endpoints

### A05 — Security Misconfiguration

Defaults, stack traces in production, verbose error messages, default credentials.

**Grep signals:**
- `NODE_ENV !== 'production'` allowing verbose errors
- Default passwords / credentials committed
- S3 buckets / storage with public read/write
- Kubernetes: `runAsUser: 0`, `privileged: true`, `hostNetwork: true`

### A06 — Vulnerable and Outdated Components

Known CVEs in dependencies, EOL versions.

Delegated to sub-axis 3d (Supply Chain) — A06 findings are cross-referenced there.

### A07 — Identification and Authentication Failures

Weak password policies, missing MFA, session fixation, credential stuffing.

**Grep signals:**
- Password policy too lax (< 12 chars, missing complexity)
- Session IDs in URLs
- `Set-Cookie` without `HttpOnly`, `Secure`, `SameSite`
- Missing account lockout / CAPTCHA after failed attempts

### A08 — Software and Data Integrity Failures

Unverified updates, deserialization of untrusted data, CI/CD pipeline compromise.

**Grep signals:**
- `JSON.parse(untrustedInput)` of user-supplied payloads
- Deserialisation of untrusted serialised data (Python unsafe deserialisers, Java `ObjectInputStream`, PHP `unserialize`) — prefer safe formats (JSON, Protocol Buffers)
- Unsigned Docker image pulls
- Package install from untrusted registry

Crosses over with 3d (Supply Chain) and A10.

### A09 — Security Logging and Monitoring Failures

Insufficient logging of security events, no alerting, log tampering.

**Grep signals:**
- Auth failures not logged
- PII in plaintext logs (maps to 3c Data Privacy)
- Missing correlation IDs
- Logs written without structured format (maps to 5b Observability)

### A10 — Mishandling of Exceptional Conditions (NEW in 2025)

Exceptions eaten silently, fallback to insecure defaults, error paths that bypass security controls.

**Grep signals:**
- `catch (e) {}` (empty catch) swallowing security-relevant exceptions
- Auth middleware that returns `next()` on error
- `try { verify(); } catch { return true; }` — failing open on security check
- `logger.warn('Unknown value')` on auth decision → BLOCKER (a log is NOT an alert)

Heavy overlap with sub-axis 2a (Zero Fallback / Zero False Data). A10 findings that are also zero-fallback violations should be tagged with BOTH sub-axes (`perspectives: [security, zero_fallback]`) and carry the higher severity.

---

## Phase 5 extensions

Beyond the 10 categories above, sub-axis 3a in Phase 5 also detects:

- **CORS reflection attacks** (CORS Origin header reflected without allowlist)
- **Server-side request forgery to metadata services** (SSRF to `169.254.169.254`)
- **Insecure direct object reference via slugs** (not just IDs)
- **Race-condition token reuse** (same token accepted twice before rate limiter fires)
- **Weak secret-derivation** (PBKDF2 < 100k iterations, bcrypt cost < 12)
