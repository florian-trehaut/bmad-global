# module.yaml Conventions

**Purpose:** Defines how module.yaml works, including variables, templates, and how they provide context to agents and workflows.

---

## Overview

`module.yaml` is the configuration file for a BMAD module. It:
- Defines module metadata (code, name, description)
- Collects user input via prompts during installation
- Makes those inputs available to agents and workflows as variables
- Specifies whether the module should be selected by default

---

## Frontmatter Fields

### Required Fields

```yaml
code: {module-code}              # kebab-case identifier (2-20 chars)
name: "Display Name"             # Human-readable name
header: "Brief description"      # One-line summary
subheader: "Additional context"  # More detail
default_selected: false          # Auto-select on install?
```

### `default_selected` Guidelines

| Module Type | default_selected | Example |
|-------------|------------------|---------|
| Core/Primary | `true` | BMM (agile software delivery) |
| Specialized | `false` | CIS (creative innovation), Fromagerie |
| Experimental | `false` | New modules in development |

---

## Variables System

### Core Config Variables (Always Available)

These variables are automatically available to ALL modules:

```yaml
# Variables from Core Config inserted:
## user_name                  # User's name
## communication_language     # Preferred language
## document_output_language   # Output document language
## output_folder              # Default output location
```

No need to define these — they're injected automatically. Document them as comments.

---

### Custom Variables

Define custom variables for user input:

```yaml
variable_name:
  prompt: "Question to ask the user?"
  default: "{default_value}"
  result: "{template_for_final_value}"
```

### Variable Templates

In `prompt` and `result`, you can use templates:

| Template | Expands To |
|----------|------------|
| `{value}` | The user's input |
| `{directory_name}` | Current directory name |
| `{output_folder}` | Output folder from core config |
| `{project-root}` | Project root path |
| `{variable_name}` | Another variable's value |

---

## Variable Types

### 1. Simple Text Input

```yaml
project_name:
  prompt: "What is the title of your project?"
  default: "{directory_name}"
  result: "{value}"
```

### 2. Boolean/Flag

```yaml
enable_feature:
  prompt: "Enable this feature?"
  default: false
  result: "{value}"
```

### 3. Single Select

```yaml
skill_level:
  prompt: "What is your experience level?"
  default: "intermediate"
  result: "{value}"
  single-select:
    - value: "beginner"
      label: "Beginner - Explains concepts clearly"
    - value: "intermediate"
      label: "Intermediate - Balanced approach"
    - value: "expert"
      label: "Expert - Direct and technical"
```

### 4. Multi Select

```yaml
platforms:
  prompt: "Which platforms do you need?"
  default: ["unity", "unreal"]
  result: "{value}"
  multi-select:
    - value: "unity"
      label: "Unity"
    - value: "unreal"
      label: "Unreal Engine"
```

### 5. Multi-Line Prompt

```yaml
complex_variable:
  prompt:
    - "First question?"
    - "Second context?"
    - "Third detail?"
  default: "default_value"
  result: "{value}"
```

### 6. Required Variable

```yaml
critical_variable:
  prompt: "Required information:"
  required: true
  result: "{value}"
```

### 7. Path Variable

```yaml
artifacts_folder:
  prompt: "Where should artifacts be stored?"
  default: "{output_folder}/artifacts"
  result: "{project-root}/{value}"
```

### 8. Variable Inheritance / Aliasing

```yaml
primary_artifacts:
  prompt: "Where should primary artifacts be stored?"
  default: "{output_folder}/artifacts"
  result: "{project-root}/{value}"

sprint_artifacts:
  inherit: "primary_artifacts"
```

---

## How Variables Become Available

### To Agents

After installation, variables are available in agent context:

```yaml
{variable_name}  # Expands to the user's configured value
```

### To Workflows

Workflows can reference module variables in their files:

```yaml
---
outputFile: '{implementation_artifacts}/my-output.md'
---
```

---

## Best Practices

### DO:
- Keep prompts clear and concise
- Provide sensible defaults
- Use `result: "{project-root}/{value}"` for paths
- Use single/multi-select for structured choices
- Group related variables logically
- Document core config variables as comments

### DON'T:
- Overwhelm users with too many questions
- Ask for information that could be inferred
- Use technical jargon in prompts
- Create variables that are never used
- Use absolute paths in defaults

---

## Variable Naming

- **snake_case** (e.g., `planning_artifacts`, `user_skill_level`)
- Descriptive but concise
- Avoid conflicts with core variables

---

## Quick Reference

| Pattern | Use Case |
|---------|----------|
| Simple text input | Names, titles, descriptions |
| Boolean/Flag | Enable/disable features |
| Single select | Experience levels, categories |
| Multi select | Platforms, frameworks, options |
| Multi-line prompt | Complex questions needing context |
| Required | Must-have information |
| Path variable | Directory locations |
| Inherit/Alias | Compatibility, references |
