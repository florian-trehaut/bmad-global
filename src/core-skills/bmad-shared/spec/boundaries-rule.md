# Boundaries Triple Rule

**This document is loaded by all bmad-* workflow skills that produce or consume story specs.** It defines the agent execution constraints expressed as a triple bucket (Always Do / Ask First / Never Do) per Addy Osmani's "good spec for AI agents" framework.

## The Rule

Every story spec MUST include a "Boundaries" section with three buckets:

### ✅ Always Do (no approval needed)

Safe, project-aligned actions the implementing agent may take without consultation.

**Project-level baseline:**
- Run the project's quality command (e.g. `npm run quality`) before declaring a task complete
- Follow naming conventions documented in `project.md#conventions`
- Use the project's logger (never raw `console.log` in committed code)
- Update test fixtures when the schema changes
- Use TypeScript strict mode where the file already opts in

Story-specific additions go HERE (see `bmad-shared/data/boundaries-triple-template.md`).

### ⚠️ Ask First (high-impact, require explicit user approval)

Changes with significant blast radius. The agent MUST stop and request approval before executing.

**Project-level baseline:**
- Add a new dependency to `package.json` / `requirements.txt` / `Cargo.toml`
- Modify CI/CD pipeline files
- Modify migration files that have already run on staging or production
- Bump major version of a runtime / framework / database client
- Disable / skip a failing test (even temporarily)
- Touch files outside the scope declared in the story
- Run `git push --force` / `--force-with-lease`
- Modify shared protocols, knowledge schema, validation tooling

Story-specific additions go HERE.

### 🚫 Never Do (hard stops, no exceptions)

Actions the agent MUST refuse, even when explicitly asked, until the underlying issue is fixed.

**Project-level baseline:**
- Commit secrets, API keys, tokens, credentials, or `.env` files
- Edit `node_modules/`, `vendor/`, `dist/`, or other generated directories
- Remove a failing test to make CI pass
- Use `--no-verify`, `--no-gpg-sign`, or other flags that skip git hooks
- `git reset --hard` or `git clean -fd` on uncommitted user changes
- Push directly to `main` / `master` (must go through PR / MR, except for trunk-based projects that explicitly allow direct main commits — verify per workflow-context.md)
- Disable security checks, linters, or type-checkers globally

Story-specific additions go HERE.

## Why three buckets

The triple removes ambiguity:
- **Always Do** = green light, no slowdown for safe work
- **Ask First** = yellow light, pause for human judgement on high-impact decisions
- **Never Do** = red light, hard stop with no override path

Free-form "guidelines" produce inconsistent results from AI agents. Explicit buckets produce repeatable behaviour.

## Cross-references

- "Never Do" overrides "Ask First" overrides "Always Do" — no item should appear in more than one bucket
- Items in "Ask First" / "Never Do" MUST come from a documented source (CLAUDE.md, security policy, compliance, this rule)
- Story-specific additions must NOT contradict project-level baselines
- Pre-commit / pre-push hooks that fail are NEVER pre-existing — see `~/.claude/CLAUDE.md` Hard Rules

## Anti-patterns

- "Be careful" in any bucket → REJECT, not actionable
- Single-item buckets → REJECT, you haven't thought about it
- "Never do anything risky" → REJECT, define risky in the story's context
- Story-specific items that conflict with the project baseline → REJECT, fix the conflict

## Application by Workflow Phase

| Workflow | How to apply |
|----------|-------------|
| **create-story / quick-dev** | Step-11-plan composes the boundaries triple, merging project baseline + story-specific items. |
| **review-story** | Step-05-analyze flags boundary contradictions or missing buckets as MAJOR. |
| **dev-story** | Step-08-implement consults boundaries before each task. Always Do = proceed; Ask First = HALT and ask user; Never Do = HALT and refuse. |
| **code-review** | Meta-1 detects boundary violations in the diff (e.g. modified files outside scope, secret committed). |
| **troubleshoot** | scope-completeness audits whether the patch respected boundaries declared in the original story. |

## Exemption rule

The only valid exemption is an explicit user instruction in the conversation citing this rule by name. The user can grant a one-shot waiver for an "Ask First" item, but cannot waive a "Never Do" item — those reflect hard rules from project policy.
