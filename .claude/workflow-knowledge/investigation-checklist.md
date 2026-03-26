---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: f2ea1ef5
---

# Investigation Checklist — Knowledge

Domain-specific investigation guides for spec review (review-story workflow).
Each domain lists what to verify with REAL DATA, not code analysis.

---

## Domain: Skill System

### Key Files

- `src/bmm-skills/` — all method skills by phase
- `src/core-skills/` — utility/framework skills
- `tools/validate-skills.js` — validation rules
- `tools/skill-validator.md` — full rule specification

### Verification Points

- [ ] Does the proposed change respect the canonical skill structure (SKILL.md, workflow.md, steps/, data/, templates/)?
- [ ] Does the skill name follow `bmad-*` convention?
- [ ] Does SKILL.md frontmatter have required `name` and `description` fields?
- [ ] Does `description` contain "Use when" or "Use if"?
- [ ] Are step files numbered sequentially (step-01 through step-N, 2–10 steps)?
- [ ] Do file references use relative paths (no `{installed_path}`)?
- [ ] Does the skill pass all 27 validation rules?
- [ ] Does workflow.md NOT have `name` or `description` in frontmatter?

### Common Failure Modes

- Hardcoded absolute paths leaking into skill files
- Step files referencing non-existent data or template files
- SKILL.md description missing "Use when" trigger phrase
- Step count outside 2-10 range
- Forward-loading of step files (loading step N+1 before completing step N)

---

## Domain: CLI / Installer

### Key Files

- `tools/cli/bmad-cli.js` — CLI entrypoint
- `tools/cli/commands/` — install, uninstall, status commands
- `tools/cli/installers/lib/core/global-installer.js` — core install logic
- `tools/bmad-npx-wrapper.js` — npx binary wrapper

### Verification Points

- [ ] Does the installer correctly resolve skill paths from src/ to ~/.claude/skills/?
- [ ] Are all module.yaml variables properly resolved during install?
- [ ] Does the installer handle existing installations (update, quick-update)?
- [ ] Does the installer detect and handle config files correctly?
- [ ] Does the installer create required directories from module.yaml `directories` list?
- [ ] Does the npx wrapper correctly delegate to bmad-cli.js?

### Common Failure Modes

- Path resolution errors between src/ structure and installed flat structure
- Module.yaml variable interpolation failures (`{project-root}`, `{value}`, `{directory_name}`)
- Overwriting user config during update (should preserve config.user.yaml)
- Missing dependencies at install time

---

## Domain: Documentation / Website

### Key Files

- `website/astro.config.mjs` — Astro configuration
- `tools/build-docs.mjs` — docs build + llms.txt generation
- `docs/` — documentation source (Diataxis structure)

### Verification Points

- [ ] Do doc links resolve correctly after changes?
- [ ] Does `llms-full.txt` stay under 600k char limit?
- [ ] Are new skills documented in the appropriate docs section?
- [ ] Does the docs build complete without errors?
- [ ] Are translations (fr/, zh-cn/) consistent with English source?

### Common Failure Modes

- Broken internal links after skill renaming
- llms.txt exceeding size limit after adding content
- Astro build errors from malformed MDX
- Missing frontmatter in docs pages

---

## Domain: Validation System

### Key Files

- `tools/validate-skills.js` — skill validation (14 deterministic rules)
- `tools/skill-validator.md` — full rule specification (27 rules)
- `tools/validate-file-refs.js` — file reference integrity
- `test/test-file-refs-csv.js` — reference validator tests

### Verification Points

- [ ] Do all existing skills still pass validation after changes?
- [ ] Are new validation rules backward-compatible?
- [ ] Does the validator correctly report file:line for findings?
- [ ] Does `--strict` mode correctly exit 1 on HIGH+ findings?
- [ ] Are false positives/negatives properly handled?

### Common Failure Modes

- New validation rule breaking existing valid skills
- Regex patterns too strict or too loose
- Missing test fixtures for edge cases
- GitHub Actions annotation format errors

---

## Cross-Cutting Concerns

### Impact Analysis (ALWAYS RUN)

- [ ] Does a skill format change affect the installer's manifest generation?
- [ ] Does a CLI change affect existing installed projects (`~/.claude/skills/`)?
- [ ] Does a validator rule change cause existing skills to fail?
- [ ] Does a docs change affect llms.txt generation?

### Backward Compatibility

- [ ] Can users with existing `~/.claude/skills/` installations update cleanly?
- [ ] Are module.yaml config variables backward-compatible?
- [ ] Do renamed/removed skills have migration paths?

### Non-regression

- [ ] All existing tests pass? (`npm test`)
- [ ] Quality gate passes? (`npm run quality`)
- [ ] Skill validation passes for all skills? (`npm run validate:skills`)
- [ ] File references valid? (`npm run validate:refs`)
