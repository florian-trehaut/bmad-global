# Workflow Spec Template

Use this template when generating workflow specification placeholder files. These go in `workflows/{workflow-name}/{workflow-name}.spec.md` and serve as build instructions for `bmad-workflow-builder`.

---

```markdown
# {Workflow Display Name} — Workflow Specification

**Module:** {module_code}
**Workflow:** {workflow-name}
**Status:** Specification Only — needs building with bmad-workflow-builder

---

## Purpose

{1-3 sentences describing what this workflow accomplishes and when to use it}

## Primary Agent(s)

{Which agent(s) primarily trigger or use this workflow}

- `{agent-role-name}` — {how the agent uses this workflow}

## Planned Stages

{Ordered list of workflow stages/phases}

1. **{Stage Name}** — {brief description of what happens}
2. **{Stage Name}** — {brief description of what happens}
3. **{Stage Name}** — {brief description of what happens}

## Input

{What the workflow expects as input}

- {input description}

## Output

{What the workflow produces}

- {output description}

## Dependencies

{External tools, data sources, or other workflows needed}

- {dependency description, or "None"}

## Build Notes

{Any special considerations for building this workflow}

---

> Build this workflow using `bmad-workflow-builder`. Provide this spec file as input.
```

---

## Generation Rules

1. **Directory** — Create `workflows/{workflow-name}/` folder
2. **File name** — `{workflow-name}.spec.md` inside the workflow folder
3. **Purpose** — Clear description from Phase 3 workflow list
4. **Stages** — List 3-7 planned stages per workflow
5. **Agents** — Reference only agents planned for this module
6. **Status** — Always "Specification Only" for new modules
