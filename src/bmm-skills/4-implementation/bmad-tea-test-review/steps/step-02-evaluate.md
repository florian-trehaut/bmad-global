# Step 2: Quality Evaluation

## STEP GOAL

Evaluate each test file across 5 quality dimensions (determinism, isolation, maintainability, coverage, performance), calculate a severity-weighted score per dimension, then aggregate into an overall 0-100 quality score.

## RULES

- Read each test file fully before evaluating — do not guess from file names
- Every violation must reference a specific `file:line` location
- Every violation must cite the knowledge base fragment that defines the rule
- Do not modify any test file — this is read-only analysis
- If a violation has a justification comment in the code (e.g., `// Justified: ...`), note it as an acknowledged exception and do not penalize

## SEQUENCE

### 1. Parse test files

For each file in `TEST_FILES`, read the full content and extract:

- File size (line count)
- Test framework detected (confirm from imports)
- Describe/test block count
- Imports, fixtures, factories
- Network interception patterns
- Waits/timeouts
- Control flow constructs (if/else, try/catch, switch)
- Assertion count and types
- Test IDs and priority markers (if present)

### 2. Evaluate Dimension A: Determinism (weight: 25%)

**Reference KB:** `test-quality.md` (determinism criteria), `network-first.md`

Scan each test file for non-deterministic patterns:

**HIGH severity violations (-10 points each):**
- `Math.random()` without seed — non-deterministic data
- `Date.now()` or `new Date()` without mocking — time dependency
- `setTimeout`/`setInterval` without proper waits — timing dependency
- External API calls without mocking/interception — environment dependency
- Race conditions: navigation before route interception is set up

**MEDIUM severity violations (-5 points each):**
- `page.waitForTimeout(N)` or `cy.wait(N)` — hard waits instead of condition-based waits
- Flaky selectors (CSS classes that may change, nth-child without data-testid)
- Test order dependencies (test B assumes test A ran first)

**LOW severity violations (-2 points each):**
- Console timestamps without fixed timezone
- Loose timeout thresholds

Calculate dimension score: `max(0, 100 - sum(penalties))`

### 3. Evaluate Dimension B: Isolation (weight: 25%)

**Reference KB:** `test-quality.md` (isolation criteria), `fixture-architecture.md`, `data-factories.md`

Scan for isolation issues:

**HIGH severity violations (-10 points each):**
- Global state mutations (global variables modified in test body)
- Test order dependencies (`test.describe.serial` without justification)
- Shared database records created without cleanup
- `beforeAll`/`afterAll` with side effects leaking across tests

**MEDIUM severity violations (-5 points each):**
- Missing cleanup hooks (data created but never deleted)
- Shared fixtures that mutate state
- Environment variables modified without restoration
- Hardcoded IDs/emails that will collide in parallel runs

**LOW severity violations (-2 points each):**
- Tests sharing read-only data (not mutating, but coupling)
- Missing `test.describe` grouping for related tests

Calculate dimension score: `max(0, 100 - sum(penalties))`

### 4. Evaluate Dimension C: Maintainability (weight: 20%)

**Reference KB:** `test-quality.md` (length, assertions), `selective-testing.md`

Scan for maintainability issues:

**HIGH severity violations (-10 points each):**
- Test file exceeds 300 lines
- Assertions hidden in helper functions (not visible in test body)
- Duplicate test logic across files (copy-paste)
- No describe/test structure (flat test file)

**MEDIUM severity violations (-5 points each):**
- Test names lack Given/When/Then or descriptive structure
- Magic numbers/strings without constants or factories
- Excessive nesting (>3 levels deep)
- Large setup blocks (>30 lines in beforeEach)

**LOW severity violations (-2 points each):**
- Inconsistent naming conventions within a file
- Could benefit from extraction into helper/fixture
- Inconsistent assertion styles

Calculate dimension score: `max(0, 100 - sum(penalties))`

### 5. Evaluate Dimension D: Coverage (weight: 15%)

**Reference KB:** `test-levels-framework.md`, `selective-testing.md`

Assess coverage quality (only if story/test-design context is available; otherwise score as N/A and redistribute weight):

**HIGH severity violations (-10 points each):**
- P0 acceptance criteria from story with no corresponding test
- Critical user path identified in test-design with no test
- Error handling not tested (no negative test cases for critical paths)

**MEDIUM severity violations (-5 points each):**
- Only happy path tested (no error scenarios)
- Test level mismatch (E2E test for something that should be a unit test, or vice versa)
- Missing edge cases for boundary values

**LOW severity violations (-2 points each):**
- Minor edge cases not covered
- Redundant tests covering the same path at the same level

**If no story/test-design context:** Skip this dimension. Redistribute weight: determinism 30%, isolation 30%, maintainability 25%, performance 15%.

Calculate dimension score: `max(0, 100 - sum(penalties))`

### 6. Evaluate Dimension E: Performance (weight: 15%)

**Reference KB:** `test-quality.md` (duration criteria)

Scan for performance issues:

**HIGH severity violations (-10 points each):**
- Tests using `test.describe.serial` without justification (blocks parallelization)
- Expensive setup repeated per test instead of shared via fixture
- Full page navigation where API call would suffice

**MEDIUM severity violations (-5 points each):**
- Hard waits >2 seconds (also a determinism issue, but here measuring CI impact)
- Large data sets created in tests without need
- Unnecessary full-page reloads between actions

**LOW severity violations (-2 points each):**
- Missing `test.describe.configure({ mode: 'parallel' })` where safe
- Minor inefficiencies (excessive logging, unused imports)

Calculate dimension score: `max(0, 100 - sum(penalties))`

### 7. Calculate overall score

**Weighted aggregation:**

```
OVERALL_SCORE = (determinism_score * 0.25)
             + (isolation_score * 0.25)
             + (maintainability_score * 0.20)
             + (coverage_score * 0.15)
             + (performance_score * 0.15)
```

If coverage was skipped (no context), use redistributed weights:
```
OVERALL_SCORE = (determinism_score * 0.30)
             + (isolation_score * 0.30)
             + (maintainability_score * 0.25)
             + (performance_score * 0.15)
```

**Apply bonus points (max +15):**
- All tests use proper fixture patterns: +3
- All tests use data factories (no hardcoded data): +3
- All tests follow network-first pattern: +3
- Perfect isolation (zero shared state): +3
- All test IDs present and well-formed: +3

```
FINAL_SCORE = min(100, max(0, OVERALL_SCORE + BONUS))
```

**Determine grade:**

| Score | Grade | Assessment |
|-------|-------|------------|
| 90-100 | A | Excellent |
| 80-89 | B | Good |
| 70-79 | C | Acceptable |
| 60-69 | D | Needs Improvement |
| <60 | F | Critical Issues |

**Determine recommendation:**

| Grade | Recommendation |
|-------|---------------|
| A, B | Approve |
| C | Approve with Comments |
| D | Request Changes |
| F | Block |

### 8. Aggregate all violations

Collect all violations from all dimensions into a single list, sorted by severity (HIGH first), then by file:line.

Count:
- `TOTAL_VIOLATIONS` = total count
- `HIGH_COUNT` = HIGH severity violations
- `MEDIUM_COUNT` = MEDIUM severity violations
- `LOW_COUNT` = LOW severity violations

### 9. Display evaluation summary

Present to the user:

> **Quality Evaluation Complete**
>
> **Overall Score:** {FINAL_SCORE}/100 (Grade: {GRADE})
>
> **Dimension Scores:**
> - Determinism: {score}/100
> - Isolation: {score}/100
> - Maintainability: {score}/100
> - Coverage: {score}/100 (or N/A)
> - Performance: {score}/100
>
> **Violations:** {HIGH_COUNT} HIGH, {MEDIUM_COUNT} MEDIUM, {LOW_COUNT} LOW
> **Bonus Points:** +{BONUS}
>
> **Recommendation:** {recommendation}

Do NOT wait for confirmation — proceed directly to report generation.

---

**Next:** Read fully and follow `./step-03-report.md`
