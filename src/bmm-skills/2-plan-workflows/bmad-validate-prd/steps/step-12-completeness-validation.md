---
nextStepFile: './step-13-report-complete.md'
---

# Step 12: Completeness Validation

## STEP GOAL

Final comprehensive completeness check -- validate no template variables remain, each section has required content, section-specific completeness, and frontmatter is properly populated.

## RULES

- Focus ONLY on completeness verification, not quality (done in step 11)
- Systematic checklist-style verification
- This step runs autonomously -- no user input needed, auto-proceeds when complete
- Attempt subprocess first, fall back to direct analysis if unavailable

## SEQUENCE

### 1. Attempt Sub-Process Validation

Try to use Task tool to spawn a subprocess:

"Perform completeness validation on this PRD -- final gate check:

**1. Template Completeness:**
- Scan PRD for any remaining template variables
- Look for: {variable}, {{variable}}, {placeholder}, [placeholder], etc.
- List any found with line numbers

**2. Content Completeness:**
- Executive Summary: Has vision statement?
- Success Criteria: All criteria measurable?
- Product Scope: In-scope and out-of-scope defined?
- User Journeys: User types identified?
- Functional Requirements: FRs listed with proper format?
- Non-Functional Requirements: NFRs with metrics?

For each section: Is required content present? (Yes/No/Partial)

**3. Section-Specific Completeness:**
- Success Criteria: Each has specific measurement method?
- User Journeys: Cover all user types?
- Functional Requirements: Cover MVP scope?
- Non-Functional Requirements: Each has specific criteria?

**4. Frontmatter Completeness:**
- stepsCompleted: Populated?
- classification: Present (domain, projectType)?
- inputDocuments: Tracked?
- date: Present?

Return completeness matrix with status for each check."

If no Task tool, manually scan for template variables, check each section for required content, verify frontmatter fields, build completeness matrix.

### 2. Build Completeness Matrix

**Template Completeness:**
- Template variables found: count
- List if any found

**Content Completeness by Section:**
- Executive Summary: Complete / Incomplete / Missing
- Success Criteria: Complete / Incomplete / Missing
- Product Scope: Complete / Incomplete / Missing
- User Journeys: Complete / Incomplete / Missing
- Functional Requirements: Complete / Incomplete / Missing
- Non-Functional Requirements: Complete / Incomplete / Missing
- Other sections: [List completeness]

**Section-Specific Completeness:**
- Success criteria measurable: All / Some / None
- Journeys cover all users: Yes / Partial / No
- FRs cover MVP scope: Yes / Partial / No
- NFRs have specific criteria: All / Some / None

**Frontmatter Completeness:**
- stepsCompleted: Present / Missing
- classification: Present / Missing
- inputDocuments: Present / Missing
- date: Present / Missing

**Overall completeness:**
- Sections complete: X/Y
- Critical gaps: [list if any]

### 3. Report Completeness Findings to Validation Report

Append to validation report:

```markdown
## Completeness Validation

### Template Completeness

**Template Variables Found:** {count}
{If count > 0, list variables with line numbers}
{If count = 0, note: No template variables remaining}

### Content Completeness by Section

**Executive Summary:** [Complete/Incomplete/Missing]
{If incomplete or missing, note specific gaps}

**Success Criteria:** [Complete/Incomplete/Missing]
{If incomplete or missing, note specific gaps}

**Product Scope:** [Complete/Incomplete/Missing]
{If incomplete or missing, note specific gaps}

**User Journeys:** [Complete/Incomplete/Missing]
{If incomplete or missing, note specific gaps}

**Functional Requirements:** [Complete/Incomplete/Missing]
{If incomplete or missing, note specific gaps}

**Non-Functional Requirements:** [Complete/Incomplete/Missing]
{If incomplete or missing, note specific gaps}

### Section-Specific Completeness

**Success Criteria Measurability:** [All/Some/None] measurable
{If Some or None, note which criteria lack metrics}

**User Journeys Coverage:** [Yes/Partial/No] - covers all user types
{If Partial or No, note missing user types}

**FRs Cover MVP Scope:** [Yes/Partial/No]
{If Partial or No, note scope gaps}

**NFRs Have Specific Criteria:** [All/Some/None]
{If Some or None, note which NFRs lack specificity}

### Frontmatter Completeness

**stepsCompleted:** [Present/Missing]
**classification:** [Present/Missing]
**inputDocuments:** [Present/Missing]
**date:** [Present/Missing]

**Frontmatter Completeness:** {complete_fields}/4

### Completeness Summary

**Overall Completeness:** {percentage}% ({complete_sections}/{total_sections})

**Critical Gaps:** [count] [list if any]
**Minor Gaps:** [count] [list if any]

**Severity:** [Critical if template variables exist or critical sections missing, Warning if minor gaps, Pass if complete]

**Recommendation:**
[If Critical] "PRD has completeness gaps that must be addressed before use. Fix template variables and complete missing sections."
[If Warning] "PRD has minor completeness gaps. Address minor gaps for complete documentation."
[If Pass] "PRD is complete with all required sections and content present."
```

### 4. Display Progress and Auto-Proceed

Display: "**Completeness Validation Complete**

Overall Completeness: {percentage}% ({severity})

**Proceeding to final step...**"

Without delay, read fully and follow: {nextStepFile}
