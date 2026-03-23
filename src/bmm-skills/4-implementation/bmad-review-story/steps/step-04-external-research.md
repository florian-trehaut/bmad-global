# Step 4: External Research

## STEP GOAL

Research external documentation, best practices, and standards relevant to the story. Complement the internal investigation with authoritative external sources.

## RULES

- Use WebSearch and documentation MCP tools for up-to-date information
- Focus on version-specific documentation (match the versions used in the project)
- Document sources with links for traceability
- Only research topics directly relevant to the story — do not go on tangents

## SEQUENCE

### 1. Official documentation

Based on the story context and technologies identified in Step 3:

- APIs/protocols used by the story (REST, SFTP, GraphQL, webhooks, etc.)
- Provider-specific documentation (partner docs, API references)
- Library/framework documentation — version-specific for the versions used in the project
- Use WebSearch for current documentation and known issues

### 2. Best practices

Research industry standards relevant to the story's domain:

- Data handling best practices (validation, sanitization, encoding)
- Security best practices relevant to the story
- Performance patterns for the scale involved (batch processing, pagination, connection pooling)
- Error handling and retry patterns

### 3. Known issues and gotchas

Search for common pitfalls with the technologies used:

- Breaking changes or deprecations in the specific versions of dependencies
- Common integration pitfalls
- Similar implementations and lessons learned

### 4. Document research findings

Append to the intermediate file:

```markdown
## External Research

### Official Documentation
- {source}: {key findings relevant to the story}

### Best Practices
- {practice}: {relevance to the story}

### Known Issues / Gotchas
- {issue}: {impact on the story}
```

### 5. Proceed

Load and execute `./steps/step-05-analyze.md`.
