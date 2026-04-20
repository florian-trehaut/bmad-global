---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
---

# Subagent Workflow: Review Perspectives

**Goal:** Execute assigned review perspectives and produce a structured findings report.

**Scope:** This subagent analyzes the diff and reports findings. It does NOT fix code, edit files, or touch the tracker.

---

## ANTI-DEVIATION CONTRACT

You received a `review_contract` embedded in the `Agent()` prompt from the orchestrator. This is your SOLE source of truth.

**Rules:**

- Execute ONLY the perspectives listed in `contract.perspectives`
- Review ONLY files listed in `contract.changed_files`
- Load and apply project review perspectives from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md` if it exists (JIT loading)
- Load and apply `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md` (always)
- Load stack knowledge from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` if it exists (for reference code, legacy code, forbidden patterns)
- Report findings with exact file:line references
- You are **READ-ONLY** -- do NOT edit, fix, commit, or modify anything
- Do NOT run format, lint --fix, or any write operation

**HALT POLICY:**

- NEVER skip a perspective
- NEVER downgrade a BLOCKER to WARNING
- NEVER mark PASS without evidence

---

## INPUT FORMAT (provided in Agent prompt by the orchestrator)

```yaml
review_contract:
  worktree_path: '/path/to/worktree'
  mr_target_branch: 'main'
  mr_iid: 123
  group_id: 'A'  # A, B, C, S1, or S2
  perspectives: ['specs_compliance', 'security']  # Only execute these

  # Tracker issue context (null if no issue linked)
  linear_issue:
    identifier: 'PRJ-48'
    description: |
      ... (full issue description)
    acceptance_criteria:
      - id: 'AC1'
        text: 'criteria text'

  # Files changed in this MR
  changed_files:
    - 'apps/service/src/domain/entities/foo.entity.ts'
    - 'apps/service/src/domain/ports/foo.port.ts'
  diff_stats: '+142/-38 across 8 files'

  # Phase 2 suspicious removals (from regression risk detection)
  phase2_suspicious_removals: [...]  # Only for Group A (specs compliance)
```

---

## EXECUTION SEQUENCE

### 1. Verify Environment

```bash
cd {worktree_path}
git log -1 --oneline
```

### 2. Load Knowledge Files (JIT)

```bash
# Load shared rules (always)
Read(~/.claude/skills/bmad-shared/no-fallback-no-false-data.md)

# Load project review perspectives (if exists)
Read({MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md)  # project-specific checklists

# Load stack knowledge (if exists)
Read({MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md)  # reference code, legacy dirs, forbidden patterns
```

### 3. Construct Diff

```bash
cd {worktree_path}
git diff --stat origin/{mr_target_branch}...HEAD
git diff --name-only origin/{mr_target_branch}...HEAD
git diff origin/{mr_target_branch}...HEAD
```

For large diffs (>1000 lines total), prioritize:
1. Files with domain/business logic changes
2. Files with security-sensitive changes (auth, validation, secrets)
3. Test files (for QA perspective)
4. Infrastructure/config files

### 4. Execute Assigned Perspectives

Execute ONLY the perspectives listed in `contract.perspectives`, in the order below. Skip any perspective NOT in the list.

---

## PERSPECTIVE: specs_compliance

**Condition:** Only if `contract.linear_issue` is not null AND `specs_compliance` in `contract.perspectives`.

"Does the code do what was asked?"

### AC Coverage

For EACH acceptance criterion in `contract.linear_issue.acceptance_criteria`:

```yaml
ac_coverage:
  - ac_id: 'AC1'
    ac_text: '{text}'
    implemented: true | false
    implementation_location: 'file.ts:line'
    tested: true | false
    test_location: 'file.spec.ts:line'
    status: 'COMPLIANT' | 'PARTIAL' | 'NOT_IMPLEMENTED'
```

### Scope Analysis

- **Scope creep?** Code that does MORE than asked -> QUESTION
- **Missing?** Code that does LESS than asked -> BLOCKER
- **Deviation?** Code that does SOMETHING ELSE -> BLOCKER

### Regression Risk Cross-Reference

If `contract.phase2_suspicious_removals` is present, verify each suspicious removal against issue scope. Removals out of scope = BLOCKER.

### Checklist

- [ ] All acceptance criteria implemented
- [ ] Each criterion has a corresponding test
- [ ] Edge cases mentioned in the issue are handled
- [ ] Technical approach matches issue description (if specified)
- [ ] No over-engineering beyond the requirement
- [ ] No code out-of-scope of the issue

---

## PERSPECTIVE: zero_fallback (ALWAYS EXECUTED -- not conditional)

**Load and apply `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md`**

This perspective is ALWAYS executed regardless of `contract.perspectives`. It catches the most dangerous class of bugs: code that appears to work but sends wrong data.

### Grep Scans

```bash
cd {worktree_path}
grep -rn "?? 0\|?? ''\||| 0\||| ''\|?? 'N/A'\|?? 'Unknown'" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
grep -rn "/ 1\.2\|/ 1\.1\|\* 0\.8\|\* 1\.2" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"
```

### Checks

- [ ] No fallback to wrong data: `??`/`||` on business-critical fields -> verify fallback is semantically identical. If not -> BLOCKER
- [ ] No computed substitutions: deriving a value from wrong source -> BLOCKER
- [ ] No silent defaults: `0`, `''`, `'N/A'`, `'Unknown'` as defaults on fields flowing to external systems -> BLOCKER
- [ ] Null rejection present: business-critical fields have explicit null checks with throw + alert -> missing = BLOCKER
- [ ] No downstream effects on failure: notifications sent only after successful persistence -> sending before = BLOCKER

---

## PERSPECTIVE: security

**Condition:** `security` in `contract.perspectives`.

Apply project security checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md` if loaded, otherwise:

- [ ] Injection: SQL raw concat, command exec/spawn, XSS
- [ ] Auth/AuthZ: missing guards/decorators, privilege escalation
- [ ] Input validation: missing DTOs, validation decorators
- [ ] Sensitive data: secrets/PII in logs, hardcoded credentials
- [ ] Crypto: weak MD5/SHA1, `Math.random()` for security
- [ ] Race conditions: TOCTOU, missing transactions
- [ ] Framework config: missing security headers, permissive CORS, missing rate limiting

### Additional Security Rules

- Secrets as CLI arguments instead of env vars -> BLOCKER
- Differentiated error responses revealing account existence -> WARNING
- Timing side-channels on auth paths -> WARNING
- SSRF: external URLs fetched without validation -> BLOCKER
- Untrusted dynamic data overriding trusted static config via spread -> WARNING
- No size limit on external file download streams -> WARNING
- TOCTOU: `findFirst` + `update` instead of atomic operation -> WARNING
- DB operations not scoped by tenant/provider -> BLOCKER

### Grep Scans

```bash
cd {worktree_path}
grep -rn "exec\|spawn\|execSync" --include="*.ts" {changed_files_dirs} | grep -v node_modules | grep -v "spec.ts"
grep -rn "queryRawUnsafe\|executeRawUnsafe" --include="*.ts" {changed_files_dirs}
grep -rn "password\|secret\|api_key\|apiKey\|token" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v ".d.ts"
```

---

## PERSPECTIVE: qa

**Condition:** `qa` in `contract.perspectives`.

Apply project QA checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md` if loaded.

### Forbidden Patterns (BLOCKER)

```bash
cd {worktree_path}
grep -rn "jest\.mock\|vi\.mock" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
```

Any result = BLOCKER (exception: `jest.fn()` for callbacks/event handlers only).

```bash
grep -rn "jest\.spyOn\|vi\.spyOn\|jest\.fn\|vi\.fn" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
```

### Fake Test Detection (BLOCKER)

```bash
grep -rn "expect(true)\.toBe(true)\|describe\.skip\|it\.skip\|xit\|xdescribe" --include="*.spec.ts" --include="*.test.ts" {changed_files_dirs}
```

### Test Completeness vs Acceptance Criteria

If `contract.linear_issue` is not null:
- [ ] Every AC has at least one test? Missing P0 coverage = BLOCKER, P1 = WARNING
- [ ] Test levels match strategy?
- [ ] P0 ACs: happy + error + edge. P1: happy + error.

### Test Quality

- [ ] New source files have corresponding `.spec.ts`?
- [ ] Happy path, error paths, edge cases tested?
- [ ] In-memory fakes used (not mocks)?
- [ ] No fake tests?
- [ ] Tests deterministic, isolated, < 300 lines?

---

## PERSPECTIVE: code_quality

**Condition:** `code_quality` in `contract.perspectives`.

Apply project code quality checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md` if loaded.

- [ ] Architecture boundaries (domain never imports infrastructure -> BLOCKER)
- [ ] Ports explicit in domain layer
- [ ] Thin controllers, DDD patterns, clear naming
- [ ] No `any` without justification
- [ ] No `@ts-ignore` without justification
- [ ] No `console.log` in production code
- [ ] No duplication, no dead code
- [ ] Database: N+1 queries (BLOCKER), missing transactions, unbounded queries

### Grep Scans

```bash
cd {worktree_path}
grep -rn "console\.log\|console\.error\|console\.warn" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "test.ts"
grep -rn ": any\|as any" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts"
grep -rn "@ts-ignore\|@ts-expect-error" --include="*.ts" {changed_files_dirs}
grep -rn "from.*infrastructure" {changed_files_dirs} | grep "/domain/"
```

---

## PERSPECTIVE: tech_lead

**Condition:** `tech_lead` in `contract.perspectives`.

Apply project tech lead checklist from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/review-perspectives.md` if loaded.

- [ ] SOLID principles
- [ ] N+1 queries, scalability, unbounded queries
- [ ] DI patterns, `@Injectable()` present
- [ ] Async patterns, `Promise.all` where applicable
- [ ] Monorepo impact, backward compatibility
- [ ] Multi-service impact, migration risks
- [ ] Changeset file present if packages/libs modified

### Grep Scans

```bash
cd {worktree_path}
grep -rn "export class.*Service\|export class.*Repository\|export class.*Adapter" --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "interface\|abstract"
ls .changeset/*.md 2>/dev/null | head -5
```

---

## PERSPECTIVE: patterns

**Condition:** `patterns` in `contract.perspectives`.

Use reference code directories from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` if loaded. NEVER reference legacy code.

- [ ] DTO validation patterns
- [ ] ConfigService usage (no `process.env` direct access)
- [ ] In-memory repositories for testing
- [ ] Logger usage (no `console.log`)
- [ ] Integration test setup patterns
- [ ] Error handling (domain errors + exception mapping)

For each finding, provide `file:line` of the correct pattern reference from non-legacy code.

### Grep Scans

```bash
cd {worktree_path}
grep -rn "process\.env\." --include="*.ts" {changed_files_dirs} | grep -v "spec.ts" | grep -v "configuration.ts" | grep -v "config/"
```

---

## PERSPECTIVE: commit_history

**Condition:** `commit_history` in `contract.perspectives`.

```bash
cd {worktree_path}
git log --oneline origin/{mr_target_branch}..HEAD
```

- [ ] Conventional commits format: `type(scope): description`
- [ ] No garbage commits: "fix", "wip", "typo", "test" -> BLOCKER
- [ ] Self-contained commits (each is a logical unit)
- [ ] Single commit touching > 3 distinct domains -> WARNING
- [ ] MR mixing unrelated features -> WARNING

---

## PERSPECTIVE: infra_deployability

**Condition:** `infra_deployability` in `contract.perspectives`.

A MR that passes all tests but introduces undeployable services is a BLOCKER.

### Identify Impacted Services

```bash
cd {worktree_path}
git diff --name-only origin/{mr_target_branch}...HEAD | grep -oE '^(apps|libs|packages)/[^/]+' | sort -u
```

### For Each Impacted Service, Verify:

1. **Build pipeline** exists (Dockerfile + CI build step)
2. **Database migrations** generated for schema changes
3. **Deployment config** exists and is wired
4. **Infrastructure** -- new cloud resources in Terraform
5. **Coherence** -- cross-layer consistency (Terraform <-> CI <-> code)
6. **Dependency removal** -- no stale references in Dockerfiles, CI scripts
7. **Migrations** -- nullable columns without population plan -> WARNING
8. **Environment config** -- new env vars/secrets in code but not in deployment config -> BLOCKER

---

## 5. Build Report

After executing all assigned perspectives, build the findings report.

### Deduplication

If the same `file:line` is flagged by multiple perspectives:
- Keep the highest severity
- Merge the perspective labels
- Combine fix suggestions

### Per-Perspective Scoring

For each perspective executed, compute a score (1.0 minus deductions):

```
Deductions:
  BLOCKER: -0.25
  MAJOR:   -0.10
  WARNING: -0.05
  Min score: 0.0 (cannot go below 0)
```

Report the score for each perspective executed. DO NOT compute the overall score -- the orchestrator aggregates all groups.

### Return YAML report as the Agent tool response

Return the structured YAML `perspective_report` as your final response to the orchestrator. No inter-agent messaging primitives are used — the runtime collects each Agent's response synchronously in the orchestrator's tool response block.

```yaml
perspective_report:
  group_id: '{group_id}'  # A, B, C, S1, or S2

  perspectives_completed: ['specs_compliance']
  perspectives_skipped: []  # Only if conditional and skipped

  scores:
    specs_compliance: 0.95
    qa: 0.80
    code_quality: 0.90

  findings:
    - id: 'F001'
      severity: BLOCKER
      perspective: security
      file: 'apps/service/src/api/auth.controller.ts'
      line: 42
      issue: 'Missing auth guard on protected endpoint'
      pattern_ref: 'reference/file.ts:15'
      fix: 'Add auth guard decorator before the route handler'

  specs_compliance:  # Only if specs_compliance was executed
    ac_coverage:
      - ac_id: 'AC1'
        status: 'COMPLIANT'
        implementation_location: 'src/domain/entities/foo.entity.ts:23'
        test_location: 'src/domain/entities/foo.entity.spec.ts:45'
    scope: 'COMPLIANT'

  summary:
    files_reviewed: 8
    blockers: 1
    warnings: 2
    recommendations: 0
    questions: 0
```

---

## CONSTRAINTS

### DO

- Execute ALL perspectives in `contract.perspectives` in order
- Always execute `zero_fallback` regardless of contract
- Provide file:line for every finding
- Provide pattern references from non-legacy code
- Return the structured YAML `perspective_report` as the Agent tool response

### DO NOT

- Skip any assigned perspective
- Edit, fix, or modify any file
- Run format or lint --fix
- Commit anything
- Use legacy code as reference
- Post "keep in mind for later"
- Modify tracker issues (lead handles tracing)
- Load files outside the worktree (except shared skill paths)
- Downgrade severity to avoid rejection
- Compute overall verdict (orchestrator handles consolidation)
