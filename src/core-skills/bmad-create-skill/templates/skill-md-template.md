# SKILL.md Template

Use this template when generating the SKILL.md file for a new bmad-* skill.

## Template

```markdown
---
name: bmad-{SKILL_NAME}
description: "{PURPOSE_SENTENCE}. {WHAT_IT_DOES}. Use when '{TRIGGER_1}', '{TRIGGER_2}', '{TRIGGER_3}'{ADDITIONAL_TRIGGERS} is mentioned."
---

Follow the instructions in ./workflow.md.
```

## Rules

- `{SKILL_NAME}`: lowercase, hyphenated, 2-3 words max
- `{PURPOSE_SENTENCE}`: one sentence describing the primary function
- `{WHAT_IT_DOES}`: one sentence describing the workflow (verbs: discovers, analyzes, generates, validates, etc.)
- Trigger phrases: at least 3, include English and French variants if applicable
- Body: exactly `Follow the instructions in ./workflow.md.` — nothing else

## Examples

### Project-dependent skill
```markdown
---
name: bmad-dev-story
description: "Automated story implementation workflow. Discovers work from issue tracker, sets up worktree, implements via strict TDD (red-green-refactor), self-reviews with 6 adversarial perspectives, pushes MR. Use when 'dev story', 'implement story', 'start development', 'lance le dev', 'implemente' is mentioned."
---

Follow the instructions in ./workflow.md.
```

### Standalone meta-skill
```markdown
---
name: bmad-create-skill
description: "Create a new bmad-* workflow skill from scratch. Interactive workflow that discovers requirements, designs step sequence, scaffolds files, and validates the result. Use when 'create skill', 'new workflow', 'create bmad skill', 'nouveau skill', 'creer un skill' is mentioned."
---

Follow the instructions in ./workflow.md.
```
