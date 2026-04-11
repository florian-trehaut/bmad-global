---
nextStepFile: null
---

# Step 5: The Verdict

## STEP GOAL

Step back from the details and give the user an honest assessment of where their concept stands. Finalize the PRFAQ document, produce the downstream distillate, and present completion. This is the terminal step.

## RULES

- CRITICAL: Read the complete step file before taking any action
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread
- Coaching stance: Be direct and honest -- the verdict exists to surface truth, not to soften it. But frame every finding constructively.
- All output written to documents must use `{DOCUMENT_OUTPUT_LANGUAGE}`

## SEQUENCE

### 1. The Assessment

Review the entire PRFAQ -- press release, customer FAQ, internal FAQ -- and deliver a candid verdict.

**Concept Strength:** Rate the overall concept readiness. Not a score -- a narrative assessment. Where is the thinking sharp and where is it still soft? What survived the gauntlet and what barely held together?

**Three categories of findings:**

- **Forged in steel** -- aspects of the concept that are clear, compelling, and defensible. The press release sections that would actually make a customer stop. The FAQ answers that are honest and convincing.
- **Needs more heat** -- areas that are promising but underdeveloped. The user has a direction but has not gone deep enough. These need more work before they are ready for a PRD.
- **Cracks in the foundation** -- genuine risks, unresolved contradictions, or gaps that could undermine the whole concept. Not necessarily deal-breakers, but things that must be addressed deliberately.

**Present the verdict directly.** Do not soften it. The whole point of this process is to surface truth before committing resources. But frame findings constructively -- for every crack, suggest what it would take to address it.

### 2. Finalize the Document

1. **Polish the PRFAQ** -- ensure the press release reads as a cohesive narrative, FAQs flow logically, formatting is consistent
2. **Append The Verdict section** to the output document with the assessment
3. Update frontmatter: `status: "complete"`, `stage: 5`, `updated` timestamp

### 3. Produce the Distillate

Throughout the process, you captured context beyond what fits in the PRFAQ. Source material for the distillate includes the `<!-- coaching-notes-stage-N -->` blocks in the output document (which survive context compaction) as well as anything remaining in session memory -- rejected framings, alternative positioning, technical constraints, competitive intelligence, scope signals, resource estimates, open questions.

**Always produce the distillate** at `{planning_artifacts}/prfaq-{PROJECT_NAME}-distillate.md`:

```yaml
---
title: "PRFAQ Distillate: {PROJECT_NAME}"
type: llm-distillate
source: "prfaq-{PROJECT_NAME}.md"
created: "{timestamp}"
purpose: "Token-efficient context for downstream PRD creation"
---
```

**Distillate content:** Dense bullet points grouped by theme. Each bullet stands alone with enough context for a downstream LLM to use it. Include:
- Rejected framings and why they were dropped
- Requirements signals captured during coaching
- Technical context, constraints, and platform preferences
- Competitive intelligence from discussion
- Open questions and unknowns flagged during internal FAQ
- Scope signals -- what is in, out, and maybe for MVP
- Resource and timeline estimates discussed
- The Verdict findings (especially "needs more heat" and "cracks") as actionable items

### 4. Save WIP

Update WIP file frontmatter: add `5` to `stepsCompleted`, set `status: complete`.

### 5. Present Completion

"Your PRFAQ for {PROJECT_NAME} has survived the gauntlet.

**PRFAQ:** `{planning_artifacts}/prfaq-{PROJECT_NAME}.md`
**Detail Pack:** `{planning_artifacts}/prfaq-{PROJECT_NAME}-distillate.md`

**Recommended next step:** Use the PRFAQ and detail pack as input for PRD creation. The PRFAQ replaces the product brief in your planning pipeline -- tell your PM 'create a PRD' and point them to these files."

**Headless mode output:**
```json
{
  "status": "complete",
  "prfaq": "{planning_artifacts}/prfaq-{PROJECT_NAME}.md",
  "distillate": "{planning_artifacts}/prfaq-{PROJECT_NAME}-distillate.md",
  "verdict": "forged|needs-heat|cracked",
  "key_risks": ["top unresolved items"],
  "open_questions": ["unresolved items from FAQs"]
}
```

### 6. Terminal

This is the terminal step. If the user wants to revise, loop back to the relevant step. Otherwise, the workflow is done -- proceed to the WORKFLOW COMPLETION -- RETROSPECTIVE section in `workflow.md`.

---

**Next:** This is the final step. No next step file.
