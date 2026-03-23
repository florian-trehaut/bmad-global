# Data Mapping Template

Reference template for Step 4b data mapping assessment.

## When to Use

When the feature involves an end-to-end data flow (API -> service -> DB).

## Format

```markdown
### Data Mapping

**Flow: {flow_name}**

API Input (DTO) -> Domain Model -> Entity (DB):

| API field (camelCase) | Domain field | DB column (snake_case) | Transformation |
| --------------------- | ------------ | ---------------------- | -------------- |
```

## Checklist

- [ ] All data flows identified (inbound and outbound)
- [ ] DTO field names (camelCase) mapped
- [ ] Domain model fields mapped
- [ ] DB column names (snake_case) mapped
- [ ] Transformations documented (type conversion, validation, default values)
