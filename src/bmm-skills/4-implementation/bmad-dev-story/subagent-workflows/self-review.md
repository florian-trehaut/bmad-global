---
type: 'subagent-workflow'
parent_workflow: 'bmad-dev-story'
reportFormat: '../data/review-report-format.md'
---

# Subagent Workflow: Self-Review (6 Perspectives)

**Goal:** Adversarial review of code changes with 6 perspectives and structured findings report.

**Scope:** Analyzes the diff and produces a findings report. Does NOT fix code (except trivial auto-fixes).

**Perspectives:** Specs Compliance, Zero Fallback, Security, QA, Code Quality, Tech Lead.

---

## ANTI-DEVIATION CONTRACT

You received a `review_contract` in your invocation prompt. This is your SOLE source of truth.

**Rules:**

- Review ONLY files changed since `baseline_commit`
- Verify ONLY acceptance criteria listed in `contract.acceptance_criteria`
- Load and apply ALL rules from `contract.dev_standards_path` and `contract.checklist_paths.*` (JIT)
- Report findings with exact file:line references
- FIX trivial issues (formatting, lint) immediately — commit them
- Report BLOCKER/MAJOR findings — do NOT fix these yourself
- NEVER skip a perspective, downgrade a BLOCKER, or mark PASS without evidence

---

## EXECUTION SEQUENCE

### 1. Verify Environment & Load Context

```bash
cd {worktree_path}
git branch --show-current
```

Load all standards and knowledge files JIT:

```bash
# Load dev standards from project workflow-knowledge
Read({MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md)                    # if exists
Read({MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md)      # if exists — project-specific checklists
Read(~/.claude/skills/bmad-shared/no-fallback-no-false-data.md)  # always
```

### 2. Construct Diff

```bash
git diff --stat {baseline_commit}..HEAD
git diff --name-only {baseline_commit}..HEAD
git diff {baseline_commit}..HEAD
```

---

## 6 PERSPECTIVES (ALL MANDATORY — IN ORDER)

### P1: Specs Compliance

"Does the code do what was asked — **in production**, not just in tests?"

For EACH AC: implemented? tested? **works in production?** Location (file:line)? Status: COMPLIANT / PARTIAL / NOT_IMPLEMENTED.

An AC is NOT COMPLIANT just because the code exists and tests pass. Tests use in-memory doubles that bypass the real production chain. For each AC, trace the complete production path: trigger -> processing -> observable result. Every link must exist and be active.

An AC is NOT_IMPLEMENTED if ANY of these is true:
- Code exists but a dependency is disabled in production (null provider, stub, feature flag off)
- Code exists but nothing triggers it in production (missing scheduler, missing webhook, missing event subscription)
- Code exists but the downstream service/template/endpoint it calls does not exist
- Code exists but a required config/secret is missing from deployment config
- Code exists but a migration must run first and there is no migration

COMPLIANT = the feature works end-to-end in production, not just in the test harness.

Scope analysis: creep (MORE than asked -> QUESTION), missing (LESS -> BLOCKER), deviation (SOMETHING ELSE -> BLOCKER).

### P1.5: Zero Fallback / Zero False Data (MANDATORY — before Security)

**Load and apply `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`**

Grep for silent fallbacks on business-critical fields:

```bash
cd {worktree_path}
grep -rn "?? 0\|?? ''\||| 0\||| ''\|?? 'N/A'\|?? 'Unknown'" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
```

For each match: is the fallback value semantically identical to the expected value? If not -> **BLOCKER**.

Also check for computed substitutions (deriving a value instead of reading the actual source) -> **BLOCKER**.

### P2: Security

Apply security checklist from project knowledge (`{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md`) if available, otherwise apply these defaults:

- Injection (SQL raw concat, command exec/spawn, XSS)
- Auth/AuthZ (missing guards/decorators, decorator order, privilege escalation)
- Input validation (missing DTOs, validation decorators, validation pipe)
- Sensitive data (secrets/PII in logs, hardcoded credentials)
- Crypto (weak MD5/SHA1, `Math.random()` for security)
- Race conditions (TOCTOU, missing transactions)
- Framework config (missing security headers, permissive CORS, missing rate limiting)

### P3: QA & Testing

Apply QA checklist from project knowledge if available.

**Forbidden patterns (BLOCKER):** Search for mocking patterns that indicate coupling issues in unit tests. Reference the project's stack knowledge for specific forbidden patterns.

```bash
# Generic search for mock patterns in test files
grep -rE "\.(mock|fn|spyOn)" --include="*.spec.ts" --include="*.test.ts" {changed_files}
```

Evaluate each match in context — mocks in unit tests indicate architecture coupling and should use in-memory implementations instead. Mocks in integration tests may be acceptable for external services.

**AC test completeness:** Every AC mapped to test(s). Missing P0 coverage = BLOCKER, P1 = MAJOR. Test levels match strategy. P0: happy + error + edge. P1: happy + error. P2+: happy path.

**Test quality:** corresponding test file for new source files, edge cases, in-memory fakes for ports, no fake tests, deterministic, isolated, files < 300 lines.

### P4: Code Quality

Apply code quality checklist from project knowledge if available, otherwise apply these defaults:

- Architecture boundaries (domain never imports infra — BLOCKER)
- Ports explicit in domain layer
- Thin controllers/handlers, DDD patterns, clear naming
- No untyped code without justification, no debug logging in production, no duplication, no dead code
- Database: N+1 queries (BLOCKER), missing transactions, unbounded queries

### P5: Tech Lead

Apply tech lead checklist from project knowledge if available, otherwise apply these defaults:

- SOLID principles, N+1 queries, scalability, DI patterns, async handling
- Monorepo impact, backward compatibility, idempotency
- Multi-service impact, migration risks

### P6: Pattern Consistency

If `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` specifies reference code directories and legacy directories, apply those rules. Otherwise:

- Check that new code follows patterns from the most modern/well-maintained parts of the codebase
- Never reference legacy code as a pattern to follow

For each finding, provide `file:line` of correct pattern reference.

---

## FIX TRIVIAL ISSUES

Fix immediately and commit:

```bash
{FORMAT_FIX_COMMAND}
git add {specific_files}
git commit -m "style: auto-fix formatting and lint issues"
```

Then run `{TEST_COMMAND}` and record pass/fail.

## NO "KEEP IN MIND" RULE

- Effort < 0.5d -> request the fix (WARNING/BLOCKER)
- Effort > 0.5d -> create tracker issue + reference

---

## SCORING & VERDICT

Scoring rules and output format: see {reportFormat}.

Compute scores per perspective, apply weights, determine verdict:

- **APPROVED**: overall >= 0.85 AND min(scores) >= 0.70 AND blockers == 0
- **NEEDS_WORK**: overall >= 0.65 AND blockers <= 2
- **REJECTED**: overall < 0.65 OR blockers > 2

Report via SendMessage using the YAML format from {reportFormat}.

---

## CONSTRAINTS

**DO:** Review ALL 6 perspectives in order, Specs first, file:line for every finding, reference modern code patterns, fix trivials, structured YAML report.

**DO NOT:** Skip perspectives, use legacy code as reference, post "keep in mind for later", fix BLOCKER/MAJOR, modify tracker issues, load files not in contract, downgrade severity.
