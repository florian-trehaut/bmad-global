# Quality Dimensions — Module Quick Reference

Six dimensions to keep in mind when building modules. The quality scanners check these automatically during optimization — this is a mental checklist for the build phase.

## 1. Structure Compliance

The module directory follows BMAD conventions: required files present, correct naming patterns, logical organization.

- Every module needs `module.yaml` and `README.md` at minimum
- Agent files follow `{role-name}.agent.yaml` or `.agent.md` pattern
- Workflow folders contain an entry point (`workflow.md` or `*.spec.md`)
- No stray files at the module root that don't belong

## 2. Config Quality

The module.yaml is well-structured with clear prompts, sensible defaults, and correct variable types.

- Frontmatter fields are complete and accurate
- Prompts are clear to non-technical users
- Defaults work out of the box for the common case
- Path variables use `{project-root}/{value}` in result
- No unused variables, no duplicate definitions
- Core config variables documented as comments

## 3. Agent Completeness

Every declared agent has meaningful content — at minimum an identity, role, and at least one capability.

- No empty placeholder files without at least a spec
- Agent specs clearly describe planned capabilities and build status
- Agent naming is consistent with module code convention
- Agents reference workflows that actually exist in the module

## 4. Workflow Completeness

Every workflow folder has a functional entry point with meaningful content.

- No empty workflow directories
- Workflow specs describe planned stages and scope
- Entry points (`workflow.md`) provide at least a clear purpose statement
- Workflow naming follows kebab-case convention

## 5. Documentation Quality

README.md and supporting documentation accurately describe the module's contents and usage.

- README covers all agents with names and roles
- README covers all workflows with names and purposes
- Quick start section helps new users get going
- Configuration section explains module.yaml variables
- module-help.csv has entries for each agent and workflow

## 6. Module Cohesion

Agents, workflows, and configuration form a coherent package serving a focused domain.

- All components serve the same domain
- Agent capabilities align with available workflows
- Configuration variables support the components that use them
- Module scope is neither too narrow nor too broad
- Dependencies are documented
