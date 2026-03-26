# External Data Interface Template

Reference template for Step 4b external interface assessment.

## Detection Triggers

Proactively detect if this feature involves ANY external data exchange:

- File import/export (CSV, Excel, XML, JSON, PDF upload...)
- API endpoint exposed to external consumers (partners, mobile apps, third-party)
- Webhook received from or sent to an external system
- Scheduled data feed (SFTP, object storage bucket, S3...)
- Email with structured content
- Inter-service event crossing bounded context

## Format

```markdown
### External Data Interface Contracts

#### Interface: {name} ({direction: inbound/outbound})

**Transport:** SFTP / HTTP / Webhook / Object Storage / Upload / ...
**Format:** CSV / JSON / XML / Excel / ...
**Trigger:** User upload / Scheduled / Event / API call

**Schema:**

| Field/Column | Type | Required | Validation | Maps to |
| ------------ | ---- | -------- | ---------- | ------- |

**Error handling:** {reject row / reject file / partial / dead letter}
**Volume:** {expected records}
```

## Checklist

- [ ] All external interfaces identified (inbound + outbound)
- [ ] Transport and format specified for each
- [ ] Schema with field-level validation rules
- [ ] Error handling strategy defined
- [ ] Volume estimates provided
