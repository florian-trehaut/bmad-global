---
nextStepFile: './step-07-present-findings.md'
reviewPerspectives: '../subagent-workflows/review-perspectives.md'
---

# Step 6: Execute Review

## STEP GOAL:

Execute the adversarial code review using the appropriate mode -- inline for self-review, parallel agents for colleague review.

---

## ANTI-RATIONALIZATION RULE (MANDATORY — ALL PERSPECTIVES)

Code comments that justify shortcuts, casts, workarounds, or deviations are **evidence of a problem, not an attenuation**. The dev agent is incentivized to ship — it will take shortcuts and write comments to rationalize them. The reviewer's job is to see through this.

**Detection signals:**

- A comment starting with "// This is needed because...", "// TS requires...", "// Structurally compatible..."
- An `as` cast accompanied by a comment explaining why it's "safe" or "justified"
- A `// TODO` or `// FIXME` paired with a justification for leaving it
- A comment that explains why a type violation, architecture violation, or pattern deviation is "acceptable"

**Rule:** When you encounter a comment that justifies a deviation:

1. **Ignore the comment entirely** — pretend it doesn't exist
2. **Judge the code on its own merits** — is the cast necessary? Is the shortcut the right solution?
3. **If the code needs a comment to justify itself, the code is wrong.** The fix is to make the code right, not to explain why it's wrong.
4. **Classify as WARNING minimum**, never RECOMMENDATION — a rationalized shortcut is always more severe than a style nit

---

## SELF-REVIEW MODE (REVIEW_MODE == 'self')

Execute 6 perspectives sequentially inline. Use project-specific checklists from `.claude/workflow-knowledge/review-perspectives.md` if loaded, otherwise use the default checklists below.

### Perspective 1: Specs Compliance

<check if="LINKED_TRACKER_ISSUE exists">
  "Does the code do what was asked -- **in production**, not just in tests?"

  For EACH acceptance criterion:
  - Implemented? Where (file:line)?
  - Tested? Where (file:line)?
  - Works in production? (trace the complete production path)
  - Status: COMPLIANT / PARTIAL / NOT_IMPLEMENTED

  An AC is NOT_IMPLEMENTED if ANY of these is true:
  - Code exists but a dependency is disabled in production
  - Code exists but nothing triggers it in production
  - Code exists but the downstream service/template it calls does not exist
  - Code exists but a required config/secret is missing from deployment config
  - Code exists but a migration must run first and there is no migration

  Scope analysis: creep (MORE than asked -> QUESTION), missing (LESS -> BLOCKER), deviation (SOMETHING ELSE -> BLOCKER).

  Include regression risk findings from step-05 -- the specs reviewer must verify each suspicious removal against issue scope.
</check>

### Perspective 1.5: Zero Fallback / Zero False Data (MANDATORY)

**Load and apply `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`**

Grep for silent fallbacks on business-critical fields:

```bash
cd {REVIEW_WORKTREE_PATH}
grep -rn "?? 0\|?? ''\||| 0\||| ''\|?? 'N/A'\|?? 'Unknown'" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
grep -rn "/ 1\.2\|/ 1\.1\|\* 0\.8\|\* 1\.2" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"
```

Checks:
- No fallback to wrong data (`??`/`||` on business-critical fields with semantically different fallback) -> BLOCKER
- No computed substitutions (deriving value from wrong source) -> BLOCKER
- No silent defaults (`0`, `''`, `'N/A'`, `'Unknown'`) on fields flowing to external systems -> BLOCKER
- Null rejection present for business-critical fields with throw + alert -> missing = BLOCKER
- **Data migrations that silently match zero rows are zero-fallback violations -> BLOCKER.** A `WHERE name = 'X'` that matches in one environment but not another is a migration that silently does nothing — the deployment succeeds, the data stays wrong, nobody gets alerted. "Documented for manual intervention" is NOT an acceptable mitigation. The migration must work in ALL target environments or explicitly fail (e.g., assert updated row count > 0). When DB access is available, verify WHERE clauses against real data in staging AND production before classifying.

### Perspective 2: Security

Apply project security checklist if loaded, otherwise:

- Injection: SQL raw concat, command exec/spawn, XSS
- Auth/AuthZ: missing guards/decorators, privilege escalation
- Input validation: missing DTOs, validation decorators
- Sensitive data: secrets/PII in logs, hardcoded credentials
- Crypto: weak MD5/SHA1, `Math.random()` for security
- Race conditions: TOCTOU, missing transactions
- Framework config: missing security headers, permissive CORS

Grep scans:

```bash
cd {REVIEW_WORKTREE_PATH}
grep -rn "exec\|spawn\|execSync" --include="*.ts" {changed_files_dirs} | grep -v node_modules | grep -v "spec.ts"
grep -rn "queryRawUnsafe\|executeRawUnsafe" --include="*.ts" {changed_files_dirs}
grep -rn "password\|secret\|api_key\|apiKey\|token" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v ".d.ts"
```

Additional rules:
- Secrets as CLI arguments instead of env vars -> BLOCKER
- Differentiated error responses revealing account existence -> WARNING
- SSRF: external URLs fetched without validation -> BLOCKER
- DB operations not scoped by tenant/provider -> BLOCKER

### Perspective 3: QA & Testing

Apply project QA checklist if loaded.

**Forbidden patterns (BLOCKER):**

```bash
cd {REVIEW_WORKTREE_PATH}
grep -rn "jest\.mock\|vi\.mock" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
grep -rn "expect(true)\.toBe(true)\|describe\.skip\|it\.skip\|xit\|xdescribe" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
```

Checks:
- Every AC has at least one test
- New source files have corresponding test files
- Happy path, error paths, edge cases tested
- In-memory fakes used (not mocks)
- Tests are deterministic, isolated, < 300 lines

### Perspective 4: Code Quality

Apply project code quality checklist if loaded.

- Architecture boundaries (domain never imports infrastructure -> BLOCKER)
- Ports explicit in domain layer
- Thin controllers, DDD patterns, clear naming
- No `any` without justification, no `@ts-ignore` without reason
- No `console.log` in production code
- No duplication, no dead code
- Database: N+1 queries (BLOCKER), missing transactions, unbounded queries

Grep scans:

```bash
cd {REVIEW_WORKTREE_PATH}
grep -rn "console\.log\|console\.error\|console\.warn" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
grep -rn ": any\|as any" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"
grep -rn "from.*infrastructure" {changed_files_dirs} | grep "/domain/"
```

### Perspective 5: Tech Lead

Apply project tech lead checklist if loaded.

- SOLID principles, N+1 queries, scalability
- DI patterns, async handling
- Monorepo impact, backward compatibility
- Multi-service impact, migration risks
- Data migration effectiveness: WHERE clauses in data migrations must match actual values in ALL target environments (dev, staging, production). If DB access is available, query real data to verify. A migration that silently updates 0 rows in any environment is a BLOCKER.
- Changeset file present if packages/libs modified

### Perspective 6: Pattern Consistency

Use reference code directories from `.claude/workflow-knowledge/stack.md` if loaded. NEVER reference legacy code.

- DTO validation patterns, config access patterns
- In-memory repository patterns, logger usage
- Integration test setup patterns
- Error handling patterns

For each finding, provide `file:line` of the correct pattern reference.

### Perspective 7: ADR Conformity (conditional)

<check if="PROJECT_ADRS is loaded and non-empty">
  Verify the changes don't violate active Architecture Decision Records:

  - For each ADR, check if the MR touches the domain or component covered by that ADR
  - If it does, verify the implementation follows the decided approach
  - If the MR introduces a new pattern, service, or architectural choice that contradicts an ADR → BLOCKER
  - If the MR introduces something that SHOULD have an ADR but doesn't (new service, new integration pattern, new data store, deviation from established architecture) → QUESTION: "This change introduces {X} which may warrant a new ADR."

  **Conflict resolution:** when multiple ADRs exist on the same topic, the most recent one takes precedence.
</check>

### Perspective 8: Design Decisions Audit

Identify design decisions in the code that are NOT documented in the tracker issue, MR description, or code comments:

- New patterns introduced without justification
- Architectural choices (new modules, services, layers) not in the spec
- Data model decisions (field types, naming, relationships) not specified
- Error handling strategies chosen without spec guidance
- Third-party library selections

For each undocumented decision: classify as QUESTION (not a defect — but must be surfaced for reviewer awareness). Suggest the author add a "Design decisions" section to the MR description.

### Conditional Perspectives (if applicable)

**Commit History** (always for colleague review, optional for self):
- Conventional commits format
- No garbage commits ("fix", "wip", "typo")
- Self-contained commits

**Infra Deployability** (if infrastructure changes detected):
- Build pipeline exists for impacted services
- Database migrations generated for schema changes
- Deployment config exists and is wired
- New cloud resources have Terraform
- Environment variables reference existing secrets

### Self-Review: Fix Trivials

After all perspectives, fix trivially fixable issues:

```bash
cd {REVIEW_WORKTREE_PATH}
{FORMAT_FIX_COMMAND}
```

Note files modified as `trivial_fixes_applied`.

### Self-Review: Commit Strategy — Minimal Commits

**CRITICAL:** Review fixes must NOT create new commits on the branch. The goal is a minimal commit count relative to the target branch.

1. **Amend the last commit** when the fix is directly related to its scope:
   ```bash
   cd {REVIEW_WORKTREE_PATH}
   git add <fixed_files>
   git commit --amend --no-edit
   ```

2. **Create a separate commit** ONLY when the fix is unrelated to any existing commit (e.g., fixing a pre-existing zero-fallback violation discovered during review).

3. **Push with force-with-lease** (safe force push — aborts if someone else pushed):
   ```bash
   git push origin {LOCAL_BRANCH}:{MR_SOURCE_BRANCH} --force-with-lease
   ```

**NEVER create a "review fix" commit** — amend the existing commit that the fix belongs to. The MR should look like the author got it right the first time.

Then proceed to {nextStepFile} with all findings.

---

## COLLEAGUE REVIEW MODE (REVIEW_MODE == 'colleague')

### 6.1 Prepare Review Context

Collect changed files list, diff stats (from step-04), and tracker issue context (from step-03).

### 6.2 Create Review Team

```
TeamCreate(team_name: "review-{MR_IID}", description: "Code review for !{MR_IID}")
```

### 6.3 Create 5 Review Tasks (self-service, NO owners)

**Task A -- Specs Compliance:**

```yaml
TaskCreate(
  subject: "Review Group A: Specs Compliance",
  description: |
    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'A'
      perspectives: ['specs_compliance']
      linear_issue:
        identifier: '{ISSUE_IDENTIFIER}'
        description: |
          {ISSUE_DESCRIPTION}
        acceptance_criteria:
          {AC_LIST}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'
      phase2_suspicious_removals: {PHASE2_SUSPICIOUS_REMOVALS}
  activeForm: "Reviewing specs compliance"
)
```

**Task B -- QA & Code Quality:**

```yaml
TaskCreate(
  subject: "Review Group B: QA & Code Quality",
  description: |
    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'B'
      perspectives: ['qa', 'code_quality']
      linear_issue: {SAME_AS_TASK_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'
  activeForm: "Reviewing QA & code quality"
)
```

**Task C -- Architecture & Infra:**

```yaml
TaskCreate(
  subject: "Review Group C: Tech Lead + Patterns + Commits + Infra",
  description: |
    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'C'
      perspectives: ['tech_lead', 'patterns', 'commit_history', 'infra_deployability']
      linear_issue: {SAME_AS_TASK_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'
  activeForm: "Reviewing architecture & infra"
)
```

**Task S1 -- Security Review (voting instance 1):**

```yaml
TaskCreate(
  subject: "Security Review S1 (voting instance 1 of 2)",
  description: |
    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'S1'
      perspectives: ['security']
      linear_issue: {SAME_AS_TASK_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'
  activeForm: "Security review (instance 1)"
)
```

**Task S2 -- Security Review (voting instance 2):**

```yaml
TaskCreate(
  subject: "Security Review S2 (voting instance 2 of 2)",
  description: |
    review_contract:
      worktree_path: '{REVIEW_WORKTREE_PATH}'
      mr_target_branch: '{MR_TARGET_BRANCH}'
      mr_iid: {MR_IID}
      group_id: 'S2'
      perspectives: ['security']
      linear_issue: {SAME_AS_TASK_A_OR_NULL}
      changed_files: {CHANGED_FILES_LIST}
      diff_stats: '{DIFF_STATS}'
  activeForm: "Security review (instance 2)"
)
```

All 5 tasks created with `owner=null`, no `addBlockedBy` -- all groups are independent and parallel.

### 6.4 Spawn 5 Worker Teammates

**3 review-workers** (self-claim tasks A, B, C):

```
for n in [1, 2, 3]:
  Task(
    subagent_type: 'review-worker',
    team_name: 'review-{MR_IID}',
    name: 'reviewer-{n}',
    prompt: |
      You are a code review worker in a self-service team.
      Read and follow the subagent workflow: {reviewPerspectives}
      Workflow:
      1. TaskList -> find pending tasks (owner=null)
      2. Claim the lowest ID task that is NOT a security task (group_id != S1 and != S2)
      3. Extract review_contract from task description
      4. Execute perspectives listed in the contract
      5. Report findings via SendMessage to team lead
      6. Mark task completed via TaskUpdate(status: "completed")
      7. Loop back to Step 1
      CRITICAL: Do NOT claim security tasks (S1, S2).
      CRITICAL: You are READ-ONLY.
      Team lead name: "{lead_name}"
  )
```

**2 security-reviewers** (claim tasks S1 and S2 independently):

```
for n in [1, 2]:
  Task(
    subagent_type: 'security-reviewer',
    team_name: 'review-{MR_IID}',
    name: 'security-{n}',
    prompt: |
      You are a security reviewer in a self-service team. Security ONLY.
      Claim a security task (group_id = S1 or S2) from TaskList.
      Execute the security review independently -- do NOT coordinate with the other security reviewer.
      Report findings via SendMessage to team lead.
      Team lead name: "{lead_name}"
  )
```

### 6.5 Collect Reports and Consolidate

Wait for all 5 workers to report via message delivery.

For each `perspective_report` received:
- Collect all findings into a unified list
- If a worker fails or times out: report "Perspective group {X}: review incomplete (agent timeout)"

**Security Voting Consensus (CRITICAL):**

```
# Separate security findings from S1 and S2
s1_findings = findings where group_id == 'S1'
s2_findings = findings where group_id == 'S2'

# Cross-validate each finding
for finding in s1_findings + s2_findings:
    # Same file:line flagged by BOTH? -> CONFIRMED BLOCKER
    counterpart = find_matching(finding, other_group_findings)
    if counterpart exists:
        finding.consensus = 'CONFIRMED'
        finding.severity = 'BLOCKER'  # Retain or upgrade
    elif finding.grep_based == True:
        finding.consensus = 'CONFIRMED'  # Grep findings always confirmed
    else:
        finding.consensus = 'SINGLE_REVIEWER'
        finding.severity = 'WARNING'  # Downgrade from BLOCKER to WARNING

# Log consensus decisions
for finding with consensus == 'SINGLE_REVIEWER':
    log: "Security finding {id} downgraded: flagged by only 1 reviewer"
for finding with consensus == 'CONFIRMED':
    log: "Security finding {id} CONFIRMED by both reviewers"
```

**Consolidation rules:**
- Apply security consensus rules above
- Deduplicate non-security findings with same `file:line:issue` (keep highest severity, merge perspective labels)
- Sort by severity: BLOCKER > WARNING > RECOMMENDATION > QUESTION
- Merge `specs_compliance.ac_coverage` from Group A
- Compute per-perspective scores and overall weighted score

### 6.6 Apply Trivial Fixes (orchestrator only)

Only the orchestrator runs format/lint -- workers are read-only. This prevents concurrent file edit conflicts.

```bash
cd {REVIEW_WORKTREE_PATH}
{FORMAT_FIX_COMMAND}
```

Note files modified as `trivial_fixes_applied`.

### 6.7 Cleanup Team

Send shutdown request to each worker.
After all workers confirm shutdown: `TeamDelete`.

### 6.8 Build Consolidated Report

Categorize unified findings by severity and perspective. The consolidated report is used by step-07 for presentation and step-08 for posting.

Proceed to {nextStepFile}.

---

## SCORING

**Deduction rules per finding:**

- BLOCKER: -0.25
- MAJOR: -0.10
- WARNING: -0.05
- Min score: 0.0

**Perspective weights:**

| Perspective | Weight |
|-------------|--------|
| specs_compliance | 0.25 |
| security | 0.25 |
| qa | 0.20 |
| code_quality | 0.10 |
| tech_lead | 0.10 |
| zero_fallback | 0.10 |

**Verdict:**

- `APPROVED`: overall >= 0.85 AND min(scores) >= 0.70 AND blockers == 0
- `NEEDS_WORK`: overall >= 0.65 AND blockers <= 2
- `REJECTED`: overall < 0.65 OR blockers > 2

## SUCCESS/FAILURE:

### SUCCESS: All perspectives executed, findings consolidated, verdict computed
### FAILURE: Skipping perspectives, downgrading blockers, marking PASS without evidence
