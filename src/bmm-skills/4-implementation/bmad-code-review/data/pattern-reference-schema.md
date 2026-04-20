# Pattern Reference Schema (stack.md extension)

**Consumed by:** sub-axis 4c (Pattern Consistency).

Projects that want pattern-reference-driven reviews declare their reference code in `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/stack.md` using the schema below. The Meta-4 agent consults the declared references when reporting a pattern deviation.

---

## stack.md field

```yaml
# Reference code directories — non-legacy, canonical patterns to cite in findings
reference_code:
  - 'src/modules/billing/'
  - 'src/shared/kernel/'

# Legacy code directories — NEVER cite as pattern references
legacy_code:
  - 'src/modules/legacy-invoice/'
  - 'packages/old-auth/'

# Pattern reference map: pattern name → canonical file:line
pattern_references:
  DTO validation:
    file: 'src/shared/dto/ValidatedDto.ts'
    line: 45
    note: 'Uses class-validator with explicit required/optional decorators'
  Config access:
    file: 'src/shared/config/ConfigService.ts'
    line: 12
    note: 'Single entry-point; throws on missing required fields (zero-fallback)'
  In-memory repository:
    file: 'src/shared/kernel/InMemoryRepository.ts'
    line: 8
  Logger usage:
    file: 'src/shared/logging/Logger.ts'
    line: 20
    note: 'Structured JSON; never console.log'
  Integration test setup:
    file: 'test/integration/setup.ts'
    line: 1
  Domain error + exception mapping:
    file: 'src/shared/errors/DomainError.ts'
    line: 30
```

---

## How Meta-4 consumes this

When sub-axis 4c detects a pattern deviation in `CHANGED_FILES`, it:

1. Looks up the deviation category in `stack.md.pattern_references`
2. Emits the finding with `pattern_ref: {file}:{line}` populated from the map
3. If `stack.md.pattern_references` has no entry for that category → emit `pattern_ref: null` and a WARNING note "add a canonical reference to stack.md for this pattern"

---

## Graceful fallback

If `stack.md.pattern_references` is absent, Meta-4 falls back to:

1. Searching `reference_code` directories for a plausible canonical example
2. Reporting the best match as `pattern_ref: {file}:{best_line}` with a confidence marker
3. Suggesting in the finding `fix:` field that the project add an explicit `pattern_references` entry

Under NO circumstance should Meta-4 cite a file from `legacy_code` as a pattern reference — this is an absolute rule.
