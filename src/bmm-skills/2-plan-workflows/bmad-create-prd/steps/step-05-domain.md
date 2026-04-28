# Step 5: Domain-Specific Requirements (Optional)


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-05-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-05-ENTRY PASSED — entering Step 5: Domain-Specific Requirements (Optional) with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

For complex domains only that have a mapping in ../data/domain-complexity.csv, explore domain-specific constraints, compliance requirements, and technical considerations that shape the product. This step is OPTIONAL -- skip if domain complexity is "low" from step 2.

## RULES

- Check domain complexity from step 2 classification first
- If complexity is "low", offer to skip this step
- Focus on constraints, compliance, and domain patterns -- not general requirements
- ONLY save when user chooses C (Continue)
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Check Domain Complexity

**Review classification from step 2:**

- What's the domain complexity level? (low/medium/high)
- What's the specific domain? (healthcare, fintech, education, etc.)

**If complexity is LOW:**

Offer to skip:

"The domain complexity from our discovery is low. We may not need deep domain-specific requirements. Would you like to:

- [C] Skip this step and move to Innovation
- [D] Do domain exploration anyway"

**If complexity is MEDIUM or HIGH:**

Proceed with domain exploration.

### 2. Load Domain Reference Data

Load `../data/domain-complexity.csv` and find the row where `domain` matches the domain from step 2. Extract `domain`, `complexity`, `typical_concerns`, `compliance_requirements`.

### 3. Explore Domain-Specific Concerns

**Start with what you know:**

Acknowledge the domain and explore what makes it complex:

- What regulations apply? (HIPAA, PCI-DSS, GDPR, SOX, etc.)
- What standards matter? (ISO, NIST, domain-specific standards)
- What certifications are needed? (security, privacy, domain-specific)
- What integrations are required? (EMR systems, payment processors, etc.)

**Explore technical constraints:**

- Security requirements (encryption, audit logs, access control)
- Privacy requirements (data handling, consent, retention)
- Performance requirements (real-time, batch, latency)
- Availability requirements (uptime, disaster recovery)

### 4. Document Domain Requirements

**Structure the requirements around key concerns:**

```markdown
### Compliance & Regulatory
- [Specific requirements]

### Technical Constraints
- [Security, privacy, performance needs]

### Integration Requirements
- [Required systems and data flows]

### Risk Mitigations
- [Domain-specific risks and how to address them]
```

### 5. Validate Completeness

**Check with the user:**

"Are there other domain-specific concerns we should consider? For [this domain], what typically gets overlooked?"

### N. Present MENU OPTIONS

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Innovation"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill, and when finished redisplay the menu
- IF P: Invoke the `bmad-party-mode` skill, and when finished redisplay the menu
- IF C: Save content to {outputFile}, update frontmatter, then read fully and follow: ./step-06-innovation.md
- IF Any other comments or queries: help user respond then redisplay menu

## APPEND TO DOCUMENT

When user selects 'C', append to `{outputFile}`:

```markdown
## Domain-Specific Requirements

{discovered domain requirements}
```

If step was skipped, append nothing and proceed.

---

## STEP EXIT (CHK-STEP-05-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-05-EXIT PASSED — completed Step 5: Domain-Specific Requirements (Optional)
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
