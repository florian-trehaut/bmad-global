# Step 6: External Research


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction", "tech connue", "lib stable", "deja fait dans une autre story".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-06-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-05-EXIT emis dans la conversation)
- [ ] WebSearch + WebFetch outils disponibles (verifies Step 4)
- [ ] Liste des dependances externes (libs, APIs, protocoles) extraite de Step 5

Emettre EXACTEMENT:

```
CHK-STEP-06-ENTRY PASSED — entering Step 6: External Research with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Research external documentation, best practices, and standards relevant to the story BEFORE writing the spec. The goal is to inform every technical decision, AC, NFR, and security gate item with authoritative sources — not training data, not memory, not "I think this is how it works."

## RULES

- WebSearch + WebFetch are the primary tools; complement with Context7 / library MCPs when available
- Every claim cited in the spec MUST trace back to a documented source captured here
- Version-specific findings only — generic "best practices" without version context are weaker evidence
- Search trail must be transparent — record queries even if they returned nothing useful
- Output format: follow `bmad-shared/data/external-research-template.md`

## SEQUENCE

### 1. Identify research targets

Build the research target list from Step 5 findings + Step 2 scope:

```yaml
research_targets:
  - external_apis: [{Provider X v3.2}, ...]
  - protocols: [{REST}, {SFTP}, {OAuth 2.1}, {OpenID Connect}, ...]
  - libraries: [{lib-name}@{current_version} → {target_version}, ...]
  - frameworks: [{framework}@{version}, ...]
  - data_formats: [{ISO 8601}, {RFC 3339}, ...]
  - compliance_standards: [{GDPR}, {HIPAA}, {SOC2}, ...]
  - design_patterns_relevant: [{idempotency keys}, {circuit breaker}, {state machines}, ...]
```

### 2. Official Documentation

For each target, fetch the official documentation:

- Provider / vendor docs (current version)
- Library docs (current version + target version if upgrading)
- RFC / W3C / ISO standards (cited by version, not "the latest")
- Cloud platform docs (current major version)

Use WebFetch for direct doc URLs. Use Context7 (`mcp__plugin_context7_context7__query-docs`) when available for library docs.

Capture:
- Source URL
- Version of the doc
- Key findings relevant to this story (1-2 sentences each, with section/page reference)

### 3. Best Practices

For each major design decision encountered in Step 5 (idempotency, retry strategy, pagination, error handling, etc.):

- Find at least one authoritative source (vendor blog, IETF RFC, recognised engineering org)
- Decide: applicable to this story? YES / NO / WITH ADAPTATION
- If YES, capture the recommendation and how it will inform the spec (which AC, TAC, or guardrail it justifies)

### 4. Known Issues / Gotchas

Scan for known issues in the libraries / vendors / protocols used:

- Library issue trackers (GitHub Issues, GitLab Issues)
- Library changelogs / release notes
- Vendor known-issue pages
- Security advisories (CVE, GHSA, CWE)
- Authoritative engineering blog posts mentioning bugs / surprises

Capture impact on this story and proposed mitigation. Mitigations become tasks in Step 11.

### 5. Version Constraints

For each library / framework / runtime touched:

- Current version in the project
- Target version proposed (if any)
- Rationale for the target (bug fix, security patch, feature, etc.)
- Migration steps required

### 6. Document findings

Append to the intermediate spec working file, following `bmad-shared/data/external-research-template.md`:

```markdown
## External Research (Step 6)

### Official Documentation
| Source | URL | Version | Relevance |

### Best Practices
| Topic | Source | Recommendation | Applicable? |

### Known Issues / Gotchas
| Source | Description | Impact | Mitigation |

### Version Constraints
| Component | Current | Target | Reason |

### Search Trail
- {query}: {summary}
```

### 7. Cross-link findings to upcoming spec sections

Annotate each finding with the spec section it informs:

- Best practice #2 → informs TAC-3 (Step 11)
- Known issue #1 → informs Risk-2 (Step 11) + Mitigation Task (Step 11)
- Doc finding #5 → informs NFR Performance baseline (Step 9)
- Doc finding #7 → informs Security Gate compliance row (Step 9)

This cross-linking ensures Step 11 (plan composition) doesn't lose the evidence trail.

### 8. Proceed

Load and execute `./step-07-investigate.md`.

---

## STEP EXIT (CHK-STEP-06-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-06-EXIT PASSED — completed Step 6: External Research
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: ./step-07-investigate.md
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.


---

**Next:** Read FULLY and apply: `./step-07-investigate.md` — load the file with the Read tool, do not summarise from memory, do not skip sections.
