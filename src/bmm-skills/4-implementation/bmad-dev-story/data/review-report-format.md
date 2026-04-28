# Self-Review Report Format

YAML format for code review reports (6 perspectives).

## Migration note (introduced with the Runtime Robustness Stacks story)

The perspective formerly named `zero_fallback` is renamed to `runtime_robustness` and now covers three sub-axes:

- `runtime_robustness.zero_fallback` — business-fallback rule (`no-fallback-no-false-data.md`)
- `runtime_robustness.null_safety` — runtime null/missing-value safety (`null-safety-review.md` protocol)
- `runtime_robustness.concurrency` — concurrency safety (`concurrency-review.md` protocol)

**Scope of the rename:**

- `scores.zero_fallback` → `scores.runtime_robustness` (YAML key changed)
- `findings[].perspective: zero_fallback` → `findings[].perspective: runtime_robustness`
- The shared rule file `~/.claude/skills/bmad-shared/no-fallback-no-false-data.md` is **NOT** renamed — its identifier remains "zero-fallback rules" wherever cited in workflow prose
- The `bmad-code-review` meta-2 sub-axis `2a` (zero_fallback) is **NOT** renamed — code-review keeps fine-grained sub-axes (2a zero_fallback, 2e null_safety, 2f concurrency) while dev-story summarises them under one perspective

External tools that parse this YAML must handle the rename. No backwards-compat alias is provided in v1.

```yaml
code_review_report:
  verdict: APPROVED | NEEDS_WORK | REJECTED

  scores:
    specs_compliance: 0.95
    runtime_robustness: 0.90       # renamed from zero_fallback
    security: 0.80
    qa: 0.85
    code_quality: 0.90
    tech_lead: 0.92
    overall: 0.88  # weighted sum per scoring table

  summary:
    files_reviewed: 0
    lines_changed: '+X/-Y'
    blockers: 0
    majors: 0
    warnings: 0
    trivials_fixed: 0

  specs_compliance:
    ac_coverage:
      - ac_id: 'AC1'
        status: 'COMPLIANT' | 'PARTIAL' | 'NOT_IMPLEMENTED'
        implementation_location: 'file.ts:line'
        test_location: 'file.spec.ts:line'
    scope: 'COMPLIANT' | 'CREEP' | 'MISSING'

  runtime_robustness:               # new structured detail per sub-axis
    zero_fallback:
      blockers: 0
      majors: 0
    null_safety:
      blockers: 0
      majors: 0
      stacks_applied: ['typescript']
      stacks_missing: []
    concurrency:
      blockers: 0
      majors: 0
      stacks_applied: ['typescript']
      stacks_missing: []
      race_detector_run: true | false   # for languages that have one (Go's -race)

  trivial_fixes_applied:
    - issue: formatting | lint | whitespace
      files: 3

  findings:
    - id: 'F001'
      severity: BLOCKER | MAJOR | WARNING
      perspective: specs | runtime_robustness | security | qa | code | tech_lead
      sub_axis: zero_fallback | null_safety | concurrency   # only when perspective == runtime_robustness
      source: generic | stack-{language}                    # only when perspective == runtime_robustness
      file: 'path/to/file.ts'
      line: 42
      issue: 'description of the problem'
      pattern_ref: 'path/to/reference:line'
      fix: 'how to fix it'

  tests:
    passed: true | false
    total: 0
    failures: ['test_name']

  quality:
    format: PASS | FIXED
    lint: PASS | FIXED | FAIL
    typescript: PASS | FAIL

  fix_instructions:
    - 'F001: replace mock with InMemory implementation at line 42'
```

## Scoring Rules

**Deduction rules per finding:**

- BLOCKER: -0.25 from perspective score
- MAJOR: -0.10 from perspective score
- WARNING: -0.05 from perspective score
- Min score per perspective: 0.0

For `runtime_robustness`, deductions from any sub-axis (zero_fallback / null_safety / concurrency) accumulate against the single perspective score.

**Perspective weights:**

| Perspective        | Weight |
| ------------------ | ------ |
| specs_compliance   | 0.25   |
| security           | 0.25   |
| qa                 | 0.20   |
| code_quality       | 0.10   |
| tech_lead          | 0.10   |
| runtime_robustness | 0.10   |

The 0.10 weight previously assigned to `zero_fallback` carries over to `runtime_robustness`. No other perspective is reweighted.

**Verdict rules:**

- `APPROVED`: overall >= 0.85 AND min(scores) >= 0.70 AND blockers == 0
- `NEEDS_WORK`: overall >= 0.65 AND blockers <= 2
- `REJECTED`: overall < 0.65 OR blockers > 2
