---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: 572190e0
---

# Code Review Perspectives — Knowledge

## Mandatory Perspectives (6 + 2 conditional)

### 1. Specs Compliance (ALWAYS)

- Every AC from the story must be addressed in the implementation
- No scope creep: changes not in the story ACs require justification
- DoD: tests pass, validators pass, no TODOs left in implementation
- Skill changes: does the modified skill still match its SKILL.md description?
- Step changes: does the step still follow the canonical format (goal, sequence, success/failure metrics)?

### 2. Zero Fallback / Zero False Data (ALWAYS)

- **Skill content**: No fabricated examples, placeholder data, or hallucinated tool names in workflow steps
- **CLI output**: Error messages must be accurate — no misleading "success" on partial failure
- **Config resolution**: Missing variables must HALT, never silently use empty string or default
- **File operations**: Verify paths exist before writing; never overwrite without detection
- **Validator output**: False positives/negatives are critical bugs — validator must be deterministic
- **Template content**: No placeholder sections left in generated output

### 3. Security (ALWAYS)

- No secrets, API keys, or tokens in committed files
- `.gitignore` covers `.env`, credential files, `config.user.yaml`
- CLI does not execute user-provided strings as shell commands without sanitization
- No path traversal vulnerabilities in file operations (installer writes only to intended directories)
- Installer does not modify files outside intended target directories
- No absolute paths (`/Users/`, `/home/`, `C:\`) in source files (enforced by validate-file-refs.js)

### 4. QA & Testing (ALWAYS)

- New JS tooling code has tests in `test/`
- Validators have test fixtures covering edge cases
- Skill changes are covered by `npm run validate:skills`
- File reference changes are covered by `npm run validate:refs`
- No mocking in unit tests — refactor to decouple if needed
- Test names describe the behavior, not the implementation

### 5. Code Quality (ALWAYS)

- JavaScript: Node.js patterns, proper error handling, no `any` type
- Markdown: follows `.markdownlint-cli2.yaml` rules (5 active rules)
- YAML: valid syntax, `.yaml` extension (not `.yml`), double quotes
- Skill structure follows canonical format (SKILL.md, workflow.md, steps/)
- No dead code, no commented-out code
- Step files: 2-10 per skill, sequential numbering, no gaps

### 6. Tech Lead (ALWAYS)

- Architecture: does the change fit the module-based, phase-organized structure?
- Backward compatibility: does the change break existing installed projects (`~/.claude/skills/`)?
- Performance: CLI should be fast — no unnecessary file system scans
- Distribution: changes don't break `npm publish` or npx install flow
- Conventional Commits: commit message follows `type(scope): description` convention
- Version impact: does this warrant a patch, minor, or major bump?

### 7. Pattern Consistency (CONDITIONAL — on multi-file changes)

- Skill naming: `bmad-*` convention respected
- Step file numbering: sequential, no gaps, 2-10 per skill
- Template variables: consistent `{variable}` syntax
- Module.yaml: follows established schema (code, name, variables with prompt/default/result)
- Reference existing skills as patterns when creating new ones
- SKILL.md frontmatter: `name` and `description` required, description contains "Use when"/"Use if"

### 8. Infra/CI (CONDITIONAL — on CI/workflow changes)

- GitHub Actions: workflow syntax valid, triggers correct
- npm publish: package.json metadata complete (name, version, bin, main, engines)
- Version bumping: follows semver
- Release process: tag + release + notification chain intact
- Docs build: Astro site builds, llms.txt under 600k char limit
- Quality gate: all 5 parallel jobs pass

## Severity Classification

| Severity | Criteria | Action |
|---|---|---|
| BLOCKER | Security vulnerability, data loss risk, broken AC, zero-fallback violation, validator false negative, broken install flow | Must fix before merge |
| WARNING | Performance issue, missing edge case test, minor pattern deviation, missing skill validation | Should fix, discuss |
| RECOMMENDATION | Code style, naming, minor improvement | Nice to have |
| QUESTION | Unclear intent, needs clarification | Ask author |

## Security Voting (Colleague Review)

Security findings require confirmation from 2 independent review perspectives before being classified as BLOCKER.

## Grep Scans

| Pattern | What it detects | Severity |
|---|---|---|
| `installed_path` | Hardcoded install path variable | BLOCKER (PATH-02) |
| `/Users/\|/home/\|C:\\` | Absolute paths leaked into source | BLOCKER |
| `console\.log` | Debug logging left in production CLI code | WARNING |
| `TODO\|FIXME\|HACK` | Unresolved markers | WARNING |
| `\.yml` (in YAML refs) | Wrong extension (should be .yaml) | WARNING |

## Excluded from Review

- `_bmad-output/` — generated artifacts
- `node_modules/` — dependencies
- `website/node_modules/` — docs dependencies
- `build/` — build output
- `package-lock.json` — auto-generated
- `test/fixtures/` — test data
