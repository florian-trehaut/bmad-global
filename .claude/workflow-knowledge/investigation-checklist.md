# Investigation Checklist — Knowledge

Domain-specific investigation guides for spec review (review-story workflow).
Each domain lists what to verify with REAL DATA, not code analysis.

---

## Skill System

### Sources to check
- Existing skills in `src/bmm-skills/` and `src/core-skills/`
- Upstream BMAD-METHOD skill format and conventions
- Claude Code skill/plugin documentation

### Investigation points
- [ ] Does the proposed change respect the canonical skill structure (SKILL.md, workflow.md, steps/, data/, templates/)?
- [ ] Does the skill name follow `bmad-*` convention?
- [ ] Does SKILL.md frontmatter have required `name` and `description` fields?
- [ ] Are step files numbered sequentially (step-01 through step-N, 2–10 steps)?
- [ ] Do file references use relative paths (no `{installed_path}`)?
- [ ] Does the skill pass all 28 validation rules?

---

## CLI / Installer

### Sources to check
- Current JS installer behavior (`tools/cli/`)
- Module.yaml format and variable resolution
- IDE configuration templates

### Investigation points
- [ ] Does the Rust implementation produce identical output to the JS version?
- [ ] Are all module.yaml variables properly resolved?
- [ ] Does the installer handle existing installations (update, quick-update)?
- [ ] Are config files written correctly (`_bmad/config.yaml`, `config.user.yaml`)?
- [ ] Does the installer detect and migrate legacy installations?

---

## Documentation / Website

### Sources to check
- Astro Starlight configuration (`website/astro.config.mjs`)
- Build pipeline (`tools/build-docs.mjs`)
- llms.txt generation logic

### Investigation points
- [ ] Do doc links resolve correctly after changes?
- [ ] Does `llms-full.txt` stay under 600k char limit?
- [ ] Are new skills documented in the appropriate docs section?

---

## Validation System

### Sources to check
- Skill validator rules (`tools/skill-validator.md`, `tools/validate-skills.js`)
- File reference validator (`tools/validate-file-refs.js`)

### Investigation points
- [ ] Do all existing skills still pass validation after changes?
- [ ] Are new validation rules backward-compatible?
- [ ] Does the Rust validator produce identical results to the JS version?

---

## Impact Analysis (ALWAYS RUN)

### Cross-component impact
- [ ] Does a skill format change affect the installer's manifest generation?
- [ ] Does a CLI change affect existing installed projects (`_bmad/` in user projects)?
- [ ] Does a validator rule change cause existing skills to fail?
- [ ] Does a docs change affect llms.txt generation?

### Backward compatibility
- [ ] Can users with existing `_bmad/` installations update cleanly?
- [ ] Are module.yaml config variables backward-compatible?
- [ ] Do renamed/removed skills have migration paths?

### Non-regression
- [ ] All existing tests pass?
- [ ] `npm run quality` / `cargo test` passes?
- [ ] Skill validation passes for all skills?
