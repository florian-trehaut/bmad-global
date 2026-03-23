# Agent Spec Template

Use this template when generating agent specification placeholder files. These go in `agents/{role-name}.agent.spec.md` and serve as build instructions for `bmad-agent-builder`.

---

```markdown
# {Agent Display Name} — Agent Specification

**Module:** {module_code}
**Role:** {role_name}
**File:** {role-name}.agent.yaml (or .agent.md)
**Status:** Specification Only — needs building with bmad-agent-builder

---

## Identity

- **Display Name:** {display_name}
- **Title:** {title}
- **Icon:** {icon}
- **Role:** {functional_role}

## Purpose

{1-3 sentences describing what this agent does and why it exists in the module}

## Planned Capabilities

{List of capabilities this agent should have, each with a brief description}

1. **{Capability Name}** — {brief description}
2. **{Capability Name}** — {brief description}

## Key Workflows

{List of workflows this agent will use}

- `{workflow-name}` — {what the agent uses it for}

## Memory / Sidecar

{Whether this agent needs a memory sidecar, and if so, what it should remember}

- Sidecar needed: {yes/no}
- Key memory areas: {list if applicable}

## Build Notes

{Any special considerations for building this agent}

---

> Build this agent using `bmad-agent-builder`. Provide this spec file as input.
```

---

## Generation Rules

1. **File name** — `{role-name}.agent.spec.md` where role-name matches the planned `.agent.yaml` filename
2. **Identity** — Fill in all fields from Phase 3 agent roster
3. **Capabilities** — List 2-5 planned capabilities per agent
4. **Workflows** — Reference only workflows planned for this module
5. **Memory** — Note sidecar needs from Phase 3
6. **Status** — Always "Specification Only" for new modules
