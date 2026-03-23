# module.yaml Template

Use this template when generating `module.yaml` for a new module. Replace all `{placeholders}` with actual values.

---

```yaml
code: {module_code}
name: "{module_name}"
header: "{module_header}"
subheader: "{module_subheader}"
default_selected: {default_selected}

# Variables from Core Config inserted:
## user_name
## communication_language
## document_output_language
## output_folder

# Custom Variables
# Add custom variables below. Each variable follows this pattern:
#
# variable_name:
#   prompt: "Question to ask the user?"
#   default: "{default_value}"
#   result: "{value}"
#
# For path variables:
#   result: "{project-root}/{value}"
#
# For single-select:
#   single-select:
#     - value: "option1"
#       label: "Option 1 - Description"
#
# For multi-select:
#   multi-select:
#     - value: "option1"
#       label: "Option 1"

{custom_variables}
```

---

## Generation Rules

1. **code** — Use the module code gathered in Phase 3 (kebab-case, 2-20 chars)
2. **name** — Format as `"{CODE}: {Full Name}"` where CODE is uppercase module code
3. **header** — One-line summary of the module's purpose
4. **subheader** — Additional context about configuration
5. **default_selected** — `false` for specialized modules, `true` only for core/primary
6. **Core config comments** — Always include the 4 core variable comments
7. **Custom variables** — Generate based on Phase 3 requirements, following the types documented in `./references/module-yaml-conventions.md`
