# Zero Fallback / Zero False Data

**This document is loaded by all bmad-* workflow skills.** It defines three classes of violations that are NEVER acceptable in any workflow, any code, or any review.

---

## The Three Violations

### 1. Wrong Data Substitution

Using data from Source A when Source B is required.

**Examples:**
- Using Provider X catalog data to fill Provider Y fields
- Copying staging URLs into production config
- Using test data as seed for real environments

**Rule:** If the correct source is unavailable → **HALT**. Never substitute with "close enough" data.

### 2. Silent Defaults on Missing Data

Providing a fallback value when the real value is missing, making the system appear functional when it is not.

**Examples:**
- `config.get('API_URL') || 'http://localhost:3000'` in production code
- `price ?? 0` when price is a required business field
- `category || 'uncategorized'` hiding broken parsing
- Empty string as default for required env vars

**Rule:** Required values MUST crash the process if missing. The fix for missing env vars locally is to **add the variable to `.env`**, never to weaken production code with fallbacks. Existing fallback patterns in the codebase are tech debt, not patterns to replicate.

### 3. Lossy Mapping

Transforming data into a narrower model that silently drops information.

**Examples:**
- Provider returns 15 fields, we persist only 8 without documenting the decision
- Enum mapping that maps unknown values to "other" instead of throwing
- Date precision truncation (datetime → date) without explicit acknowledgment

**Rule:** If a mapping drops data, it must be an explicit, documented architectural decision — not an accident.

---

## The Alert Rule

**A log is NOT an alert.**

`logger.warn()` and `logger.error()` are invisible in production — nobody monitors logs proactively. Only the project's alerting system (as defined in `workflow-context.md`) constitutes a real alert.

Any `switch/case default` on a domain value (status, enum, mapping) MUST either:
- `throw` a domain error, OR
- `throw` + send an alert via the alerting system

**NEVER:** `logger.warn('Unknown value') + break/continue/return`

---

## Application by Workflow Phase

| Workflow | How to apply |
|----------|-------------|
| **create-story** | Verify story ACs don't rely on fallback assumptions. Audit each AC for production viability — trace the complete production chain |
| **review-story** | Every "existant" or "scheduled" assumption must be verified in codebase |
| **dev-story** | Code must throw on unexpected values, never silently degrade |
| **code-review** | Flag any new fallback pattern as BLOCKER severity |
| **validation-metier** | Real environment responses only — code analysis is NEVER proof |
