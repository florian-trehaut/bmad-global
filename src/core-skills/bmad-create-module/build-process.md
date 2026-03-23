---
---

**Language:** Use `{communication_language}` for all output.

# Build Process

Build BMAD modules through six phases of conversational discovery. Act as an architect guide — probe deeper than what users articulate, suggest agents and workflows they haven't considered, and build a cohesive module that exceeds what they imagined.

## Phase 1: Discover Intent

Understand their vision before diving into specifics. Accept any of:

- **Module brief document** — a pre-written brief (load from `./assets/brief-template.md` for the expected format)
- **Rough idea** — a domain, problem space, or set of capabilities they want to package
- **Existing module** — an installed module to edit, extend, or convert to current standards

If editing/converting an existing module: read its `module.yaml`, scan agent and workflow files, analyze what exists vs what's missing, and understand what needs changing.

Ask what domain this serves, what agents they envision, what workflows are needed, and who the target user is.

## Phase 2: Classify Module Type

Load `./references/module-standards.md` for the full classification reference.

Classify the module:

| Type | When |
|------|------|
| **Standalone** | Brand new independent domain |
| **Extension** | Extends an existing module's agents/workflows |
| **Global** | Affects all modules (use sparingly) |

Also determine:
- Is this module local-only or intended for distribution (npm package)?
- Does it depend on other modules?

Confirm classification with the user before proceeding.

## Phase 3: Gather Requirements

Load `./references/standard-fields.md` for naming conventions and field definitions.

Gather through conversation:

### Module Identity
- **Module code** — kebab-case, 2-20 chars (e.g., `fromagerie`, `healthcare-ai`)
- **Name** — human-readable display name
- **Header** — one-line summary
- **Subheader** — additional context
- **default_selected** — auto-select on install? (usually `false` for specialized modules)

### Agent Roster
For each planned agent:
- Role name (becomes `{role-name}.agent.yaml`)
- Display name, title, icon
- Whether it needs a memory sidecar
- Key capabilities (brief — these become agent spec placeholders)

### Workflow List
For each planned workflow:
- Workflow name (becomes folder name)
- Purpose and scope
- Whether it's a core workflow or supporting workflow
- Which agent(s) primarily use it

### Configuration Variables
- Which core config variables are needed (user_name, communication_language, etc.)
- Custom variables with prompts, defaults, types (text, boolean, single-select, multi-select, path)
- Load `./references/module-yaml-conventions.md` for variable patterns

### Dependencies
- Other BMAD modules this depends on
- External tools to document in README

### Path Conventions (CRITICAL)
- **Module location:** `{project-root}/_bmad/{module-code}/`
- **Skill-internal files:** Always use `./` prefix (`./references/`, `./assets/`)
- **Config variables:** Use directly — they already contain full paths (NO `{project-root}` prefix on config vars)
  - Correct: `{output_folder}/file.md`
  - Wrong: `{project-root}/{output_folder}/file.md`
- **No absolute paths** (`/Users/...`)

## Phase 4: Draft & Refine

Once you have a cohesive picture, think one level deeper. Then present a draft plan including:

1. **Directory tree** — full module structure with all planned files
2. **Agent roster** — table of agents with roles, names, icons, sidecar needs
3. **Workflow list** — table of workflows with names, purposes, owning agents
4. **Config variables** — table of custom variables with types and defaults
5. **Dependencies** — any module or tool dependencies

Point out vague areas. Ask what else is needed. Iterate until the user says they're ready.

## Phase 5: Build

**Always load these before building:**
- Load `./references/module-standards.md` — module types, structure, naming
- Load `./references/module-yaml-conventions.md` — variable system, types, examples
- Load `./references/standard-fields.md` — field definitions, path rules

Build the module structure. Output to `{bmad_builder_output_folder}/{module-code}/`.

### Generated Files

**module.yaml** — Generate from `./assets/module-yaml-template.md`:
- Frontmatter fields (code, name, header, subheader, default_selected)
- Core config variable comments
- Custom variable definitions with all properties

**Agent placeholders** — Generate from `./assets/agent-spec-template.md`:
- One `agents/{role-name}.agent.spec.md` per planned agent
- Contains agent identity, planned capabilities, build notes

**Workflow placeholders** — Generate from `./assets/workflow-spec-template.md`:
- One `workflows/{workflow-name}/{workflow-name}.spec.md` per planned workflow
- Contains workflow purpose, planned stages, build notes

**Documentation:**
- `README.md` — module name, purpose, components, quick start, configuration, structure
- `TODO.md` — checklist of what needs building (agents, workflows, configuration)
- `module-help.csv` — help entries for the module's agents and workflows

### Directory Structure

```
{module-code}/
├── module.yaml
├── README.md
├── TODO.md
├── module-help.csv
├── agents/
│   └── {role-name}.agent.spec.md
└── workflows/
    └── {workflow-name}/
        └── {workflow-name}.spec.md
```

### Lint Gate

After building, run structural validation:

```bash
python3 ./scripts/scan-module-structure.py {module-path}
```

If any findings at high or critical severity: fix them and re-run. Repeat up to 3 attempts — if still failing after 3, report remaining findings and continue.

## Phase 6: Summary

Present what was built: location, structure, agent roster, workflow list, configuration variables, next steps.

**After the build completes, offer quality optimization:**

Ask: *"Build is done. Would you like to run a Quality Scan to validate the module further?"*

If yes, load `quality-optimizer.md` with `{scan_mode}=full` and the module path.

**Remind them:** Each agent placeholder needs to be built with `bmad-agent-builder`. Each workflow placeholder needs to be built with `bmad-workflow-builder`. Use the module-init skill to install and configure into a project.
