---
nextStepFile: null
---

# Step 14: Workflow Completion


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-14-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-14-ENTRY PASSED — entering Step 14: Workflow Completion with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## STEP GOAL

Finalize the UX design specification document, update workflow status, and suggest next steps for the project.

## RULES

- This is a FINAL step -- no further steps after this
- Update output file frontmatter with final `stepsCompleted` to indicate completion
- FORBIDDEN: loading additional steps after this one

## SEQUENCE

### 1. Announce Workflow Completion

"**UX Design Complete, {user_name}!**

I've successfully collaborated with you to create a comprehensive UX design specification for {project_name}.

**What we've accomplished:**

- Project understanding and user insights
- Core experience and emotional response definition
- UX pattern analysis and inspiration
- Design system choice and implementation strategy
- Core interaction definition and experience mechanics
- Visual design foundation (colors, typography, spacing)
- Design direction mockups and visual explorations
- User journey flows and interaction design
- Component strategy and custom component specifications
- UX consistency patterns for common interactions
- Responsive design and accessibility strategy

**The complete UX design specification is now available at:** `{planning_artifacts}/ux-design-specification.md`

**Supporting Visual Assets:**
- Color themes visualizer: `{planning_artifacts}/ux-color-themes.html`
- Design directions mockups: `{planning_artifacts}/ux-design-directions.html`

This specification is now ready to guide visual design, implementation, and development."

### 2. Workflow Status Update

- Load the project's workflow status file (if one exists)
- Update workflow_status["create-ux-design"] = `{planning_artifacts}/ux-design-specification.md`
- Save file, preserving all comments and structure
- Mark current timestamp as completion time
- Update output file frontmatter: append step 14 to `stepsCompleted`, set `lastStep = 14`

### 3. Suggest Next Steps

Invoke the `bmad-help` skill.

### 4. Final Completion Confirmation

Congratulate the user on the UX design specification you completed together.

**Next Steps Guidance:**

**Immediate Options:**
1. **Wireframe Generation** -- Create low-fidelity layouts based on UX spec
2. **Interactive Prototype** -- Build clickable prototypes for testing
3. **Solution Architecture** -- Technical design with UX context
4. **Figma Visual Design** -- High-fidelity UI implementation
5. **Epic Creation** -- Break down UX requirements for development

**Recommended Sequence:**
For design-focused teams: Wireframes -> Prototypes -> Figma Design -> Development
For technical teams: Architecture -> Epic Creation -> Development

Consider team capacity, timeline, and whether user validation is needed before implementation.

**Core Deliverables:**
- UX Design Specification: `{planning_artifacts}/ux-design-specification.md`
- Color Themes Visualizer: `{planning_artifacts}/ux-color-themes.html`
- Design Directions: `{planning_artifacts}/ux-design-directions.html`

---

## STEP EXIT (CHK-STEP-14-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-14-EXIT PASSED — completed Step 14: Workflow Completion
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.

---

## WORKFLOW EXIT (CHK-WORKFLOW-COMPLETE)

Avant de declarer la tache terminee, emettre EXACTEMENT:

```
CHK-WORKFLOW-COMPLETE PASSED — workflow bmad-create-ux-design executed end-to-end:
  steps_executed: ['01', '01b', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14']   ← liste TOUS les CHK-STEP-NN-EXIT emis dans CETTE conversation
  steps_skipped: []   ← MUST be empty unless utilisateur a explicitement autorise via citation verbatim
  final_artifacts: {liste finale}
```

Si steps_executed != ['01', '01b', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'] sequentiel ET steps_skipped sans citation user verbatim => HALT.
