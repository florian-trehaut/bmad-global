# Module Standards

**Purpose:** Defines what a BMAD module is, its structure, and the three types of modules.

---

## What is a BMAD Module?

A **BMAD module** is a self-contained package of functionality that extends the BMAD framework. Modules provide:
- **Agents** — AI personas with specialized expertise and capabilities
- **Workflows** — Structured processes for accomplishing complex tasks
- **Configuration** — module.yaml for user customization during installation

---

## Module Types

### 1. Standalone Module

A new, independent module focused on a specific domain.

**Characteristics:**
- Own module code (e.g., `fromagerie`, `healthcare-ai`, `legal-assist`)
- Independent of other modules
- Can be installed alongside any other modules
- Has its own agents, workflows, configuration

**Location:** `{project-root}/_bmad/{module-code}/`

**Example:** Fromagerie — a standalone module for artisanal cheesemaking production

---

### 2. Extension Module

Extends an existing BMAD module with additional functionality.

**Characteristics:**
- Builds upon an existing module's agents and workflows
- May add new agents or workflows that complement the base module
- Shares configuration context with the extended module
- Typically installed alongside the module it extends

**Location:** `{project-root}/_bmad/{base-module}/extensions/{extension-code}/`

**Override & Merge Pattern:**
- Same-name agent files **OVERRIDE** the base agent
- Same-name workflow folders **OVERRIDE** the base workflow
- Different-name files **ADD** to the base module

---

### 3. Global Module

Affects the entire BMAD framework and all modules.

**Characteristics:**
- Core functionality that impacts all modules
- Often provides foundational services or utilities
- Installed at the framework level
- Use sparingly — only for truly global concerns

**Location:** `{project-root}/_bmad/{module-code}/` with `global: true` in module.yaml

---

## Required Module Structure

```
{module-code}/
├── module.yaml                 # Module configuration (REQUIRED)
├── README.md                   # Module documentation (REQUIRED)
├── agents/                     # Agent definitions (if any)
│   └── {agent-name}.agent.yaml # or .agent.md
├── workflows/                  # Workflow definitions (if any)
│   └── {workflow-name}/
│       └── workflow.md         # or {workflow-name}.spec.md
├── module-help.csv             # Help entries (recommended)
└── TODO.md                     # Remaining work (recommended)
```

---

## Required Files

### module.yaml (REQUIRED)

Every module MUST have a `module.yaml` file with at minimum:

```yaml
code: {module-code}
name: "Module Display Name"
header: "Brief module description"
subheader: "Additional context"
default_selected: false
```

See: `./module-yaml-conventions.md` for full specification.

### README.md (REQUIRED)

Every module MUST have a README.md with:
- Module name and purpose
- Components section (agents, workflows)
- Quick start guide
- Configuration section
- Module structure diagram

---

## Module Type Decision Tree

```
START: Creating a module
│
├─ Is this a brand new independent domain?
│  └─ YES → Standalone Module
│
├─ Does this extend an existing module?
│  └─ YES → Extension Module
│
└─ Does this affect all modules globally?
   └─ YES → Global Module (use sparingly)
```

---

## Naming Conventions

### Module Code
- **kebab-case** (e.g., `bmm`, `cis`, `fromagerie`, `healthcare-ai`)
- Short, memorable, descriptive
- 2-20 characters
- Lowercase letters, numbers, hyphens only

### Agent Files
- Format: `{role-name}.agent.yaml` or `{role-name}.agent.md`
- Example: `pm.agent.yaml`, `cheese-master.agent.md`

### Workflow Folders
- Format: `{workflow-name}/`
- Entry point: `workflow.md` or `{workflow-name}.spec.md`
- Example: `market-research/`, `cheese-education-path/`

---

## Module Dependencies

Modules can depend on:
- **Core BMAD** — Always available
- **Other modules** — Specify in module.yaml as `dependencies:`
- **External tools** — Document in README

---

## Quick Reference

| Question | Answer |
|----------|--------|
| What's a module? | Self-contained package of agents, workflows, config |
| What are the types? | Standalone, Extension, Global |
| What's required? | module.yaml, README.md |
| Where do modules live? | `{project-root}/_bmad/{code}/` |
| How are agents named? | `{role-name}.agent.yaml` or `.agent.md` |
| How are workflows named? | `{workflow-name}/` folder with entry point |
