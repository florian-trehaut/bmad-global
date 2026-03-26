# Infrastructure Assessment Template

Reference template for Step 4 infrastructure assessment.

## Format

```markdown
### Infrastructure

**Verdict:** [No changes required | Minor changes | New resources]

**If changes:**

| Resource | Type | Action | IaC File | Notes |
|----------|------|--------|----------|-------|

**Environment variables:**

| Variable | Service | Source (env/secret) | Already exists? |
|----------|---------|---------------------|-----------------|

**Secrets:**

| Secret | Service | IAM/access binding | Already exists? |
|--------|---------|-------------------|-----------------|
```

## Checklist

- [ ] New compute services? -> Container config, IaC module
- [ ] New object storage? -> IaC resource, access bindings
- [ ] New secrets? -> Secret management, access bindings for the service
- [ ] New environment variables? -> Configuration files, container config
- [ ] Modifications to existing infrastructure-as-code?
