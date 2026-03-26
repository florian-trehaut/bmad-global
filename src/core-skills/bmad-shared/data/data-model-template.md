# Data Model Template

Reference template for Step 4 data model assessment.

## Format

```markdown
### Data Model

**Impacted tables:**

| Table | Action | Added/Modified Columns | Index | Notes |
| ----- | ------ | ---------------------- | ----- | ----- |

**Relations:**

- table_a.col -> table_b.col (type: 1:N, cascade: ...)

**Migration plan:**

1. Migration N: description (depends on: nothing)
2. Migration N+1: description (depends on: Migration N)
```

## Checklist

- [ ] Impacted tables identified
- [ ] New columns with types, constraints, defaults
- [ ] Indexes on frequently filtered columns
- [ ] Relations and FK documented
- [ ] Migration plan ordered by dependencies
- [ ] Constraints (unique, not null, check) specified
