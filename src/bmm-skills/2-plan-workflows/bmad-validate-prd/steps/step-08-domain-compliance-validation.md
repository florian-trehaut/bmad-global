---
nextStepFile: './step-09-project-type-validation.md'
domainComplexityData: '../data/domain-complexity.csv'
---

# Step 8: Domain Compliance Validation

## STEP GOAL

Validate domain-specific requirements are present for high-complexity domains (Healthcare, Fintech, GovTech, etc.), ensuring regulatory and compliance requirements are properly documented.

## RULES

- Conditional step: skip detailed checks for low-complexity domains
- Load domain complexity data from CSV before classification
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Attempt subprocess first, fall back to direct analysis if unavailable

## SEQUENCE

### 1. Load Domain Complexity Data

Load and read the complete file at `{domainComplexityData}`.

This CSV contains domain classifications, complexity levels (high/medium/low), required special sections, and key concerns for regulated industries. Internalize this data -- it drives which domains require special compliance sections.

### 2. Extract Domain Classification

From PRD frontmatter, extract `classification.domain`.

If no domain classification found, treat as "general" (low complexity) and skip to step 5.

### 3. Determine Domain Complexity

**Low complexity domains (skip detailed checks):**
- General
- Consumer apps (standard e-commerce, social, productivity)
- Content websites
- Business tools (standard)

**High complexity domains (require special sections):**
- Healthcare / Healthtech
- Fintech / Financial services
- GovTech / Public sector
- EdTech (educational records, accredited courses)
- Legal tech
- Other regulated domains

### 4. For High-Complexity Domains: Validate Required Special Sections

Attempt subprocess validation:

"Perform domain compliance validation for {domain}:

Based on {domain} requirements, check PRD for:

**Healthcare:**
- Clinical Requirements section
- Regulatory Pathway (FDA, HIPAA, etc.)
- Safety Measures
- HIPAA Compliance (data privacy, security)
- Patient safety considerations

**Fintech:**
- Compliance Matrix (SOC2, PCI-DSS, GDPR, etc.)
- Security Architecture
- Audit Requirements
- Fraud Prevention measures
- Financial transaction handling

**GovTech:**
- Accessibility Standards (WCAG 2.1 AA, Section 508)
- Procurement Compliance
- Security Clearance requirements
- Data residency requirements

**Other regulated domains:**
- Check for domain-specific regulatory sections
- Compliance requirements
- Special considerations

For each required section:
- Is it present in PRD?
- Is it adequately documented?
- Note any gaps

Return compliance matrix with presence/adequacy assessment."

If no Task tool, manually check for required sections based on domain, list present and missing sections, assess adequacy.

### 5. For Low-Complexity Domains: Skip Detailed Checks

Append to validation report:
```markdown
## Domain Compliance Validation

**Domain:** {domain}
**Complexity:** Low (general/standard)
**Assessment:** N/A - No special domain compliance requirements

**Note:** This PRD is for a standard domain without regulatory compliance requirements.
```

Display: "**Domain Compliance Validation Skipped**

Domain: {domain} (low complexity)

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}

### 6. Report Compliance Findings (High-Complexity Domains)

Append to validation report:

```markdown
## Domain Compliance Validation

**Domain:** {domain}
**Complexity:** High (regulated)

### Required Special Sections

**{Section 1 Name}:** [Present/Missing/Adequate]
{If missing or inadequate: Note specific gaps}

**{Section 2 Name}:** [Present/Missing/Adequate]
{If missing or inadequate: Note specific gaps}

[Continue for all required sections]

### Compliance Matrix

| Requirement | Status | Notes |
|-------------|--------|-------|
| {Requirement 1} | [Met/Partial/Missing] | {Notes} |
| {Requirement 2} | [Met/Partial/Missing] | {Notes} |
[... continue for all requirements]

### Summary

**Required Sections Present:** {count}/{total}
**Compliance Gaps:** {count}

**Severity:** [Critical if missing regulatory sections, Warning if incomplete, Pass if complete]

**Recommendation:**
[If Critical] "PRD is missing required domain-specific compliance sections. These are essential for {domain} products."
[If Warning] "Some domain compliance sections are incomplete. Strengthen documentation for full compliance."
[If Pass] "All required domain compliance sections are present and adequately documented."
```

### 7. Display Progress and Auto-Proceed

Display: "**Domain Compliance Validation Complete**

Domain: {domain} ({complexity})
Compliance Status: {status}

**Proceeding to next validation check...**"

Without delay, read fully and follow: {nextStepFile}
