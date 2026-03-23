# Standard Module Fields

## module.yaml Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `code` | string | kebab-case module identifier, 2-20 chars | `fromagerie`, `healthcare-ai` |
| `name` | string | Human-readable display name, pattern: `"{CODE}: {Full Name}"` | `"Fromagerie: Framework de Production"` |
| `header` | string | One-line summary shown in module listings | `"Copilote intelligent pour fromagerie"` |
| `subheader` | string | Additional context, elaborates on header | `"Guide la production et aide a scaler"` |
| `default_selected` | boolean | Auto-select during installation (`true` for core, `false` for specialized) | `false` |

## module.yaml Variable Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string or string[] | yes | Question shown to user during installation |
| `default` | any | no | Default value if user provides no input |
| `result` | string | yes | Template for the resolved value (e.g., `"{value}"`, `"{project-root}/{value}"`) |
| `required` | boolean | no | If true, user must provide a value |
| `single-select` | array | no | Array of `{value, label}` objects for single selection |
| `multi-select` | array | no | Array of `{value, label}` objects for multiple selection |
| `inherit` | string | no | Alias to another variable's value |

## Directory Fields

| Directory | Purpose | Required |
|-----------|---------|----------|
| `agents/` | Agent definition files (`.agent.yaml` or `.agent.md`) | If module has agents |
| `workflows/` | Workflow folders with entry points | If module has workflows |
| `db/` | Database schemas, migrations, seed data | Optional |
| `docs/` | Additional documentation beyond README | Optional |

## Naming Conventions

### Module Code
- kebab-case: `fromagerie`, `healthcare-ai`, `bmgd`
- 2-20 characters
- Lowercase letters, numbers, hyphens only
- Short, memorable, descriptive

### Agent Files
- Pattern: `{role-name}.agent.yaml` or `{role-name}.agent.md`
- Role name is kebab-case: `cheese-master`, `quality-inspector`
- No module code prefix in filename (module context is the parent directory)

### Workflow Folders
- Pattern: `{workflow-name}/`
- Kebab-case: `market-research`, `cheese-education-path`
- Entry point: `workflow.md` or `{workflow-name}.spec.md`

### Documentation Files
- `README.md` — module overview (REQUIRED)
- `TODO.md` — remaining work tracker (recommended)
- `module-help.csv` — help system entries (recommended)

## Path Rules

### Module Location
Modules are installed at: `{project-root}/_bmad/{module-code}/`

### Skill-Internal Files (within this builder skill)
All references to files within this skill use `./` prefix:
- `./references/module-standards.md`
- `./assets/module-yaml-template.md`
- `./scripts/scan-module-structure.py`

### Config Variables
Use directly — they already contain `{project-root}` in their resolved values:
- Correct: `{bmad_builder_output_folder}/module.yaml`
- Wrong: `{project-root}/{bmad_builder_output_folder}/module.yaml` (double-prefix)

### In Generated Modules
Module output files should use `{project-root}` only for `_bmad` paths:
- Correct: `{project-root}/_bmad/memory/...`
- Correct: `{output_folder}/artifacts/...` (config variable, already resolved)
- Wrong: `/Users/john/_bmad/...` (absolute path)
