# Module Brief Template

Use this template as the expected format for module brief documents provided as input to the build process.

---

```markdown
# Module Brief: {Module Name}

## Domain

{What domain or problem space does this module serve?}

## Vision

{1-3 sentences describing the module's purpose and value proposition}

## Target User

{Who will use this module? What's their skill level and context?}

## Module Type

{Standalone / Extension of {base-module} / Global}

## Agents

{List of planned agents with brief descriptions}

| Role Name | Display Name | Title | Key Capabilities |
|-----------|-------------|-------|-----------------|
| {role} | {name} | {title} | {capabilities} |

## Workflows

{List of planned workflows with brief descriptions}

| Workflow Name | Purpose | Primary Agent |
|--------------|---------|---------------|
| {name} | {purpose} | {agent} |

## Configuration

{Custom variables needed beyond core config}

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| {name} | {type} | {description} | {default} |

## Dependencies

{Other modules or tools this module depends on}

- {dependency or "None"}

## Notes

{Any additional context, constraints, or considerations}
```

---

## Usage

This template can be:
1. **Given to users** as a starting point for describing their module idea
2. **Used by the build process** to accept structured input in Phase 1
3. **Generated as output** during Phase 4 (Draft & Refine) for user review
