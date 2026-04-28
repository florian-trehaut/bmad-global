# Boundaries Triple Template

Reference template for Step 11 boundaries (always-do / ask-first / never-do) — agent execution constraints.

## Why Boundaries Triple

Stories implemented by AI agents (Claude Code, autonomous workers) need explicit constraints. Free-form "guidelines" produce inconsistent results. The triple gives the agent three clear buckets:

- **Always do** — safe, no approval needed
- **Ask first** — high-impact, require human acknowledgement
- **Never do** — hard stops, refuse without exception

## Format

```markdown
### Boundaries (Agent Execution Constraints)

#### ✅ Always Do (no approval needed)

- Run `npm test` before declaring a task complete
- Follow project naming conventions (see project.md#conventions)
- Log errors with structured logger (see observability requirements)
- Use TypeScript strict mode where the file already opts in
- Update test fixtures when schema changes

#### ⚠️ Ask First (high-impact, require explicit user approval)

- Add a new dependency to package.json
- Modify CI/CD pipeline files (`.github/`, `.gitlab-ci.yml`)
- Change database migration files after they have been applied to staging
- Bump a major version of a runtime / framework
- Disable / skip a failing test (even temporarily)
- Touch files outside the scope declared in this story
- Run any `git push --force` or `--force-with-lease`

#### 🚫 Never Do (hard stops)

- Commit secrets, API keys, tokens, or credentials of any kind
- Edit `node_modules/`, `vendor/`, `dist/`, or other generated directories
- Remove a failing test to make CI pass
- Use `--no-verify` to skip git hooks
- `git reset --hard` or `git clean -fd` on uncommitted user changes
- Push directly to `main` / `master` (must go through PR / MR)
- Disable security checks, linters, or type-checkers globally
```

## Checklist

- [ ] Every "Always do" is genuinely safe and project-aligned
- [ ] Every "Ask first" lists a concrete trigger (not vague "if it seems risky")
- [ ] Every "Never do" maps to a hard rule from the project (CLAUDE.md, security policy, compliance)
- [ ] At least 3 items per bucket (forces honest thinking, not box-ticking)
- [ ] Project-specific items in addition to the standard ones
- [ ] No conflict with other parts of the spec (e.g. "always update tests" + Guardrails saying "do not touch tests")

## Guidelines

**Always Do — good examples:**
- "Run linter and formatter on changed files before commit"
- "Add a unit test alongside any new function"
- "Use the project's logger, not console.log"

**Ask First — good examples:**
- "Adding a new public API endpoint" (versioning impact)
- "Changing a database column type" (migration risk)
- "Increasing timeout values" (could mask real issues)

**Never Do — good examples:**
- "Commit `.env` files"
- "Skip pre-commit hooks"
- "Edit migration files that have run in production"

## Anti-patterns

- Putting "be careful" in any bucket → REJECT, not actionable
- Single-item buckets → REJECT, you haven't thought about it
- Conflicting items between buckets → REJECT, fix the conflict
- "Never do anything risky" → REJECT, define what risky means in this story's context
