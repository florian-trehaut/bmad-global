# Universal Scanner Output Schema

All quality scanners — both LLM-based and deterministic lint scripts — MUST produce output conforming to this schema.

## Top-Level Structure

```json
{
  "scanner": "scanner-name",
  "skill_path": "{path}",
  "findings": [],
  "assessments": {},
  "summary": {
    "total_findings": 0,
    "by_severity": {},
    "assessment": "1-2 sentence overall assessment"
  }
}
```

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `scanner` | string | yes | Scanner identifier (e.g., `"module-structure"`, `"module-config"`) |
| `skill_path` | string | yes | Absolute path to the module being scanned |
| `findings` | array | yes | ALL items — issues, strengths, suggestions. Always an array |
| `assessments` | object | yes | Scanner-specific structured analysis. Free-form per scanner |
| `summary` | object | yes | Aggregate counts and brief overall assessment |

## Finding Schema (7 fields)

Every item in `findings[]` has exactly these 7 fields:

```json
{
  "file": "module.yaml",
  "line": 42,
  "severity": "high",
  "category": "frontmatter",
  "title": "Brief headline of the finding",
  "detail": "Full context — rationale, what was observed, why it matters",
  "action": "What to do about it — fix, suggestion, or instruction"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | string | yes | Relative path to the affected file. Empty string if not file-specific |
| `line` | int or null | no | Line number (1-based). `null` or `0` if not line-specific |
| `severity` | string | yes | One of the severity values below |
| `category` | string | yes | Scanner-specific category |
| `title` | string | yes | Brief headline (1 sentence) |
| `detail` | string | yes | Full context. Empty string if title is self-explanatory |
| `action` | string | yes | What to do. Empty string for strengths/notes |

## Severity Values

```
critical | high | medium | low | strength | note
```

## DO NOT

- **DO NOT** rename fields — use exactly: `file`, `line`, `severity`, `category`, `title`, `detail`, `action`
- **DO NOT** use `issues` instead of `findings`
- **DO NOT** add fields beyond the 7 defined above
- **DO NOT** use separate arrays for strengths or suggestions — they go in `findings` with appropriate severity
