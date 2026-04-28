# Step 4: External Research


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-04-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-04-ENTRY PASSED — entering Step 4: External Research with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

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

---

## STEP EXIT (CHK-STEP-04-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-04-EXIT PASSED — completed Step 4: External Research
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
