# Acceptable Fallback Rules

**Consumed by:** sub-axis 2a (Zero Fallback), 2b (Resilience), 2c (Rollback Safety), 6b (Internationalization).

Zero-fallback is a hard rule for **business-critical data**: anything that flows into billing, external systems, contracts, persisted truth, or user-visible values that must match the system of record. Fallbacks on those paths are BLOCKERs.

But not every default value is a violation. This document defines the narrow exceptions where fallbacks are acceptable — and the strict conditions they must meet.

---

## The 4-condition rule

A fallback value is **acceptable** only when ALL FOUR conditions are true:

1. **Scope is documented.** The fallback is declared in one of: ADR, source comment with rationale, or `data/acceptable-fallback-rules.md` itself. An un-rationalised fallback is always a violation.

2. **Owner and expiry are declared.** The fallback has a named owner (person or team) and an expiry date by which it must be re-evaluated. Fallbacks without an owner become permanent tech debt.

3. **Non-business-critical path.** The value does NOT flow into billing, external system payloads, contractual artefacts, audit logs, or the primary store of truth. Display-only, fallback-copy-only, retry-jitter-only values qualify.

4. **Fail-loud escape hatch.** When the fallback activates, an observable signal is emitted (metric, log with error level, alert) so the team can detect prolonged fallback usage. Silent permanent fallbacks are always violations.

If any condition fails → the fallback is a **BLOCKER** under sub-axis 2a.

---

## Documented exceptions

### UI i18n fallback text (sub-axis 6b)

```typescript
t('greeting', { defaultValue: 'Hello' })
```

**Why acceptable:** English default is display-only, has no impact on business data, and always ships as visible copy the team can verify on render. The i18n library typically exposes a `missingKeyHandler` that can log / alert.

**Owner:** Frontend platform team.
**Expiry:** Review at each release train.
**Conditions met:** (1) documented here, (2) owner declared, (3) non-business-critical (display copy), (4) `missingKeyHandler` emits signal.

Applies to: `i18next`, `FormatJS`, `vue-i18n`, `angular-i18n`.

### Retry jitter on transient failures (sub-axis 2b)

AWS-style decorrelated jitter with bounded retry budget is the textbook pattern — not a fallback in the zero-fallback sense. The original request is retried; no data is substituted.

### Feature flag defaults for kill switches (sub-axis 2c)

A flag defaulting to `false` when OpenFeature cannot reach the provider is acceptable ONLY if:
- The safer code path is behind the `false` branch (fail-closed)
- The default is documented in the flag metadata (`owner`, `expiry`)
- A metric counts default-activation events

`true`-defaulting on provider-unreachable is a **BLOCKER** unless explicitly justified under the 4-condition rule.

### Environment variable defaults — NEVER acceptable in production code

`process.env.API_URL || 'http://localhost:3000'` is ALWAYS a violation. The correct pattern is:

```typescript
const apiUrl = process.env.API_URL;
if (!apiUrl) throw new Error('API_URL is required');
```

Local development needs `.env.example` or a documented setup step, NOT a fallback in code.

---

## What is NOT acceptable (canonical violations)

- `price ?? 0` on a required business field
- `category || 'uncategorized'` hiding broken parsing
- `email || 'unknown@example.com'` flowing into outbound mail
- Enum mapping `default: return 'OTHER'` (must `throw`, not substitute)
- Provider catalog fallback: using Provider A's catalog when Provider B's is unreachable
- Data migration `WHERE name = 'X'` that silently matches zero rows in staging or production
- Staging URL copied into production config
- Logging `logger.warn('Unknown value')` and continuing — a log is NOT an alert

When in doubt, **throw**. Fallbacks are the exception, not the rule.
