# Tracker Comment Templates — Validation Metier

Use these templates to compose the structured comment posted on the issue tracker after validation.

Replace all `{placeholders}` with actual values.

---

## Template PASS

```markdown
## Validation Metier — PASS

**Issue:** {issue_identifier}
**Environment:** {environment}
**Date:** {date}
**Validated by:** {user_name} (assisted by Claude)

### Definition of Done

{dod_summary}

### Validation Metier Results

| VM | Description | Type | Verdict | Proof |
|----|-------------|------|---------|-------|
{vm_rows}

### Conclusion

All Validation Metier items are validated with tangible proof.
The issue can move to **Done**.
```

---

## Template FAIL

```markdown
## Validation Metier — FAIL

**Issue:** {issue_identifier}
**Environment:** {environment}
**Date:** {date}
**Validated by:** {user_name} (assisted by Claude)

### Definition of Done

{dod_summary}

### Validation Metier Results

| VM | Description | Type | Verdict | Proof / Failure reason |
|----|-------------|------|---------|------------------------|
{vm_rows}

### Failed Items

{failed_vm_details}

### Conclusion

**{fail_count}/{total_count}** Validation Metier items failed.
The issue remains in its current status until fixes are applied and re-validated.
```

---

## Row Formats

### VM PASS row
```
| VM-{n} | {description} | {type} | PASS | {proof_summary} |
```

### VM FAIL row
```
| VM-{n} | {description} | {type} | FAIL | {failure_reason_summary} |
```

---

## Failed VM Detail Format

```markdown
#### VM-{n}: {description}

**Type:** {type}
**Expected:** {what_was_expected}
**Observed:** {what_was_observed}
**Proof:** {proof_or_absence_of_proof}
**Action required:** {what_must_be_fixed}
```
