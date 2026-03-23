# Code Review Perspectives — Knowledge

## Perspectives (6 mandatory + 2 conditional)

### 1. Specs Compliance (ALWAYS)

- Every AC from the story must be addressed in the implementation
- No scope creep: changes not in the story ACs require justification
- DoD: tests pass, validators pass, no TODOs left in implementation
- Skill changes: does the modified skill still match its SKILL.md description?

### 2. Zero Fallback / Zero False Data (ALWAYS)

- **Skill content**: No fabricated examples, placeholder data, or hallucinated tool names in workflow steps
- **CLI output**: Error messages must be accurate — no misleading "success" on partial failure
- **Config resolution**: Missing variables must HALT, never silently use empty string or default
- **File operations**: Verify paths exist before writing; never overwrite without detection
- **Validator output**: False positives/negatives are critical bugs — validator must be deterministic

### 3. Security (ALWAYS)

- No secrets, API keys, or tokens in committed files
- `.gitignore` covers `config.user.yaml`, `.env`, credential files
- CLI does not execute user-provided strings as shell commands without sanitization
- No path traversal vulnerabilities in file operations
- Installer does not modify files outside intended directories

### 4. QA and Testing (ALWAYS)

- New Rust code has unit tests
- Validators have test fixtures covering edge cases
- Skill changes are covered by `validate:skills`
- No mocking in unit tests — refactor to decouple if needed
- Test names describe the behavior, not the implementation

### 5. Code Quality (ALWAYS)

- Rust: idiomatic patterns, proper error handling (Result/Option, no unwrap in library code)
- Markdown: follows `.markdownlint-cli2.yaml` rules
- YAML: valid syntax, consistent indentation
- Skill structure follows canonical format (SKILL.md, workflow.md, steps/)
- No dead code, no commented-out code

### 6. Tech Lead (ALWAYS)

- Architecture: does the change fit the module-based structure?
- Migration safety: does the Rust implementation maintain JS feature parity?
- Performance: CLI should be fast — no unnecessary file system scans
- Distribution: changes don't break `cargo install` or `cargo publish`
- Conventional Commits: commit message follows convention

### 7. Pattern Consistency (CONDITIONAL — on multi-file changes)

- Skill naming: `bmad-*` convention respected
- Step file numbering: sequential, no gaps
- Template variables: consistent `{variable}` syntax
- Module.yaml: follows established schema
- Reference existing skills as patterns when creating new ones

### 8. Infra Deployability (CONDITIONAL — on CI/workflow changes)

- GitHub Actions: workflow syntax valid
- Registry publish: cargo publish requirements met (Cargo.toml metadata)
- Version bumping: follows semver
- Release process: tag + release + notification chain intact

## Severity Classification

| Severity | Criteria | Action |
|---|---|---|
| BLOCKER | Security vulnerability, data loss risk, broken AC, zero-fallback violation, validator false negative | Must fix before merge |
| WARNING | Performance issue, missing edge case test, minor pattern deviation | Should fix, discuss |
| RECOMMENDATION | Code style, naming, minor improvement | Nice to have |
| QUESTION | Unclear intent, needs clarification | Ask author |

## Security Voting (Colleague Review)

Security findings require confirmation from 2 independent review perspectives before being classified as BLOCKER.

## Excluded from Review

- `_bmad-output/` — generated artifacts
- `node_modules/` — dependencies
- `target/` — Rust build output
- `website/build/` — built docs site
- `package-lock.json` — auto-generated
- `Cargo.lock` — auto-generated (but should be committed for binary crate)
