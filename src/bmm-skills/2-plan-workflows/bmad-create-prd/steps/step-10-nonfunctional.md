# Step 10: Non-Functional Requirements

## STEP GOAL

Define non-functional requirements that specify quality attributes for the product. Be SELECTIVE -- only document NFRs that actually apply to THIS specific product. NFRs define HOW WELL the system must perform, not WHAT it must do.

## RULES

- SELECTIVE: Only document NFR categories that actually apply to the product
- Each NFR must be specific and measurable -- reject vague quality attributes
- Connect NFRs to actual user needs and business context
- ONLY save when user chooses C (Continue)
- FORBIDDEN to load next step until C is selected

## SEQUENCE

### 1. Explain NFR Purpose and Scope

Start by clarifying what NFRs are and why we're selective:

**NFR Purpose:**

NFRs define HOW WELL the system must perform, not WHAT it must do. They specify quality attributes like performance, security, scalability, etc.

**Selective Approach:**

We only document NFRs that matter for THIS product. If a category doesn't apply, we skip it entirely. This prevents requirement bloat and focuses on what's actually important.

### 2. Assess Product Context for NFR Relevance

Evaluate which NFR categories matter based on product context:

**Quick Assessment Questions:**

- **Performance**: Is there user-facing impact of speed?
- **Security**: Are we handling sensitive data or payments?
- **Scalability**: Do we expect rapid user growth?
- **Accessibility**: Are we serving broad public audiences?
- **Integration**: Do we need to connect with other systems?
- **Reliability**: Would downtime cause significant problems?

### 3. Explore Relevant NFR Categories

For each relevant category, conduct targeted discovery:

#### Performance NFRs (If relevant):

- What parts of the system need to be fast for users to be successful?
- Are there specific response time expectations?
- What happens if performance is slower than expected?
- Are there concurrent user scenarios we need to support?

#### Security NFRs (If relevant):

- What data needs to be protected?
- Who should have access to what?
- What are the security risks we need to mitigate?
- Are there compliance requirements (GDPR, HIPAA, PCI-DSS)?

#### Scalability NFRs (If relevant):

- How many users do we expect initially? Long-term?
- Are there seasonal or event-based traffic spikes?
- What happens if we exceed our capacity?
- What growth scenarios should we plan for?

#### Accessibility NFRs (If relevant):

- Are we serving users with visual, hearing, or motor impairments?
- Are there legal accessibility requirements (WCAG, Section 508)?
- What accessibility features are most important for our users?

#### Integration NFRs (If relevant):

- What external systems do we need to connect with?
- Are there APIs or data formats we must support?
- How reliable do these integrations need to be?

### 4. Make NFRs Specific and Measurable

For each relevant NFR category, ensure criteria are testable:

**From Vague to Specific:**

- NOT: "The system should be fast" --> "User actions complete within 2 seconds"
- NOT: "The system should be secure" --> "All data is encrypted at rest and in transit"
- NOT: "The system should scale" --> "System supports 10x user growth with <10% performance degradation"

### 5. Generate NFR Content (Only Relevant Categories)

Prepare the content to append to the document.

### 6. Present MENU OPTIONS

Present the non-functional requirements for review, then display menu:

- Show defined NFRs
- Note that only relevant categories were included
- Emphasize NFRs specify how well the system needs to perform
- Ask if they'd like to refine further, get other perspectives, or proceed

Display: "**Select:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Polish Document"

#### Menu Handling Logic:

- IF A: Invoke the `bmad-advanced-elicitation` skill with the current NFR content, process the enhanced quality attribute insights that come back, ask user if they accept the improvements, if yes update content then redisplay menu, if no keep original content then redisplay menu
- IF P: Invoke the `bmad-party-mode` skill with the current NFR list, process the collaborative technical validation and additions, ask user if they accept the changes, if yes update content then redisplay menu, if no keep original content then redisplay menu
- IF C: Append the final content to {outputFile}, update frontmatter by adding this step name to the end of the stepsCompleted array, then read fully and follow: ./step-11-polish.md
- IF Any other: help user respond, then redisplay menu

## APPEND TO DOCUMENT

When user selects 'C', append the content directly to the document (only include sections that are relevant):

```markdown
## Non-Functional Requirements

### Performance

[Performance requirements based on conversation - only include if relevant]

### Security

[Security requirements based on conversation - only include if relevant]

### Scalability

[Scalability requirements based on conversation - only include if relevant]

### Accessibility

[Accessibility requirements based on conversation - only include if relevant]

### Integration

[Integration requirements based on conversation - only include if relevant]
```

## NFR CATEGORY GUIDANCE

**Include Performance When:**

- User-facing response times impact success
- Real-time interactions are critical
- Performance is a competitive differentiator

**Include Security When:**

- Handling sensitive user data
- Processing payments or financial information
- Subject to compliance regulations
- Protecting intellectual property

**Include Scalability When:**

- Expecting rapid user growth
- Handling variable traffic patterns
- Supporting enterprise-scale usage
- Planning for market expansion

**Include Accessibility When:**

- Serving broad public audiences
- Subject to accessibility regulations
- Targeting users with disabilities
- B2B customers with accessibility requirements
