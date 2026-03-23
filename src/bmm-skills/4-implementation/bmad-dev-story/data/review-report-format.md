# Self-Review Report Format

YAML format for code review reports (6 perspectives).

```yaml
code_review_report:
  verdict: APPROVED | NEEDS_WORK | REJECTED

  scores:
    specs_compliance: 0.95
    zero_fallback: 0.90
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

  trivial_fixes_applied:
    - issue: formatting | lint | whitespace
      files: 3

  findings:
    - id: 'F001'
      severity: BLOCKER | MAJOR | WARNING
      perspective: specs | zero_fallback | security | qa | code | tech_lead
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

**Perspective weights:**

| Perspective      | Weight |
| ---------------- | ------ |
| specs_compliance | 0.25   |
| security         | 0.25   |
| qa               | 0.20   |
| code_quality     | 0.10   |
| tech_lead        | 0.10   |
| zero_fallback    | 0.10   |

**Verdict rules:**

- `APPROVED`: overall >= 0.85 AND min(scores) >= 0.70 AND blockers == 0
- `NEEDS_WORK`: overall >= 0.65 AND blockers <= 2
- `REJECTED`: overall < 0.65 OR blockers > 2
