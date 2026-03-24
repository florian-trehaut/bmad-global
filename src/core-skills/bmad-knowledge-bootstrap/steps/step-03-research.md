# Step 3: Research Stack Conventions

## STEP GOAL

For each technology detected in step 2, research best practices, conventions, forbidden patterns, and security considerations. This research enriches the knowledge files beyond what codebase scanning alone can provide.

## RULES

- Research only technologies that were DETECTED — do not research hypothetical stacks
- Focus on conventions and forbidden patterns — not tutorials
- Keep research findings structured and actionable
- Skip this step if TARGET_FILES contains only tracker.md or environment-config.md (these don't benefit from web research)

## SEQUENCE

### 1. Determine Research Targets

From `detected_stack`, identify technologies that need research:

| Detected | Research Topics |
|----------|----------------|
| {language} | Naming conventions, forbidden patterns, common anti-patterns |
| {framework} | Project structure conventions, configuration patterns, security defaults |
| {test_runner} | Test file naming, assertion patterns, forbidden test patterns (mocking?) |
| {linter} | Key rules to enforce, common suppressions to watch for |
| {ci_platform} | Pipeline best practices, caching strategies, security scanning |

### 2. Execute Research

For each research target, perform a web search focused on:

1. **Conventions** — file naming, project structure, coding style specific to the detected stack
2. **Forbidden patterns** — anti-patterns, security pitfalls, deprecated APIs
3. **Test conventions** — test file organization, assertion libraries, mocking policies
4. **Security** — OWASP-relevant patterns for the detected stack, common vulnerabilities

Store findings as structured notes per technology:

```yaml
research_findings:
  {technology}:
    conventions:
      - {finding}
    forbidden_patterns:
      - {finding}
    test_conventions:
      - {finding}
    security_patterns:
      - {finding}
```

### 3. Log Research Summary

Log which technologies were researched and key findings count. This data feeds into step-05 (generate).

---

**Next:** Read fully and follow `./step-04-scan.md`
