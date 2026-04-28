# Step 1b: Workflow Continuation


## NO-SKIP CLAUSE (workflow-adherence Rule 1)

Ce step DOIT etre execute integralement. La SEULE raison valide de skip est une instruction explicite de l'utilisateur DANS CETTE CONVERSATION nommant ce step specifique. Aucune autre raison n'est valide.

Sont rejetes (rationalizations interdites): "simple", "trivial", ".md only", "spec only", "validators verts", "user expert", "je sais deja", "overkill", "Phase 3 light", "couvert ailleurs", "implicite", "auto mode", "no time", "compaction".

Si tu construis un de ces arguments => STOP, c'est la rationalization, execute le step.

## STEP ENTRY (CHK-STEP-01b-ENTRY)

Avant d'executer, verifier:

- [ ] Step precedent complete (CHK-STEP-{NN-1}-EXIT emis dans la conversation, OU step 01)
- [ ] Variables requises en scope (verifier avant action)
- [ ] Working state attendu

Emettre EXACTEMENT:

```
CHK-STEP-01b-ENTRY PASSED — entering Step 1b: Workflow Continuation with {var=value, ...}
```

Si une precondition manque => HALT, signaler quelle precondition.

## MANDATORY EXECUTION RULES (READ FIRST):

- ✅ YOU ARE A CONTINUATION FACILITATOR, not a fresh starter
- 🎯 RESPECT EXISTING WORKFLOW state and progress
- 📋 UNDERSTAND PREVIOUS SESSION context and outcomes
- 🔍 SEAMLESSLY RESUME from where user left off
- 💬 MAINTAIN CONTINUITY in session flow and rapport
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the `communication_language`

## EXECUTION PROTOCOLS:

- 🎯 Load and analyze existing document thoroughly
- 💾 Update frontmatter with continuation state
- 📖 Present current status and next options clearly
- 🚫 FORBIDDEN repeating completed work or asking same questions

## CONTEXT BOUNDARIES:

- Existing document with frontmatter is available
- Previous steps completed indicate session progress
- Brain techniques CSV loaded when needed for remaining steps
- User may want to continue, modify, or restart

## YOUR TASK:

Analyze existing brainstorming session state and provide seamless continuation options.

## CONTINUATION SEQUENCE:

### 1. Analyze Existing Session

Load existing document and analyze current state:

**Document Analysis:**

- Read existing `{brainstorming_session_output_file}`
- Examine frontmatter for `stepsCompleted`, `session_topic`, `session_goals`
- Review content to understand session progress and outcomes
- Identify current stage and next logical steps

**Session Status Assessment:**
"Welcome back {{user_name}}! I can see your brainstorming session on **[session_topic]** from **[date]**.

**Current Session Status:**

- **Steps Completed:** [List completed steps]
- **Techniques Used:** [List techniques from frontmatter]
- **Ideas Generated:** [Number from frontmatter]
- **Current Stage:** [Assess where they left off]

**Session Progress:**
[Brief summary of what was accomplished and what remains]"

### 2. Present Continuation Options

Based on session analysis, provide appropriate options:

**If Session Completed:**
"Your brainstorming session appears to be complete!

**Options:**
[1] Review Results - Go through your documented ideas and insights
[2] Start New Session - Begin brainstorming on a new topic
[3] Extend Session - Add more techniques or explore new angles"

**HALT — wait for user selection before proceeding.**

**If Session In Progress:**
"Let's continue where we left off!

**Current Progress:**
[Description of current stage and accomplishments]

**Next Steps:**
[Continue with appropriate next step based on workflow state]"

### 3. Handle User Choice

Route to appropriate next step based on selection:

**Review Results:** Load appropriate review/navigation step
**New Session:** Start fresh workflow initialization
**Extend Session:** Continue with next technique or phase
**Continue Progress:** Resume from current workflow step

### 4. Update Session State

Update frontmatter to reflect continuation:

```yaml
---
stepsCompleted: [existing_steps]
session_continued: true
continuation_date: { { current_date } }
---
```

## SUCCESS METRICS:

✅ Existing session state accurately analyzed and understood
✅ Seamless continuation without loss of context or rapport
✅ Appropriate continuation options presented based on progress
✅ User choice properly routed to next workflow step
✅ Session continuity maintained throughout interaction

## FAILURE MODES:

❌ Not properly analyzing existing document state
❌ Asking user to repeat information already provided
❌ Losing continuity in session flow or context
❌ Not providing appropriate continuation options

## CONTINUATION PROTOCOLS:

- Always acknowledge previous work and progress
- Maintain established rapport and session dynamics
- Build upon existing ideas and insights rather than starting over
- Respect user's time by avoiding repetitive questions

## NEXT STEP:

Route to appropriate workflow step based on user's continuation choice and current session state.

---

## STEP EXIT (CHK-STEP-01b-EXIT)

Avant de transitionner, emettre EXACTEMENT:

```
CHK-STEP-01b-EXIT PASSED — completed Step 1b: Workflow Continuation
  actions_executed: {liste concrete des actions ; jamais "done", "ok", "completed" seuls}
  artifacts_produced: {fichiers crees/modifies, decisions prises, outputs concrets}
  next_step: {chemin step suivant, ou "WORKFLOW-COMPLETE"}
```

Si tu ne peux pas remplir avec des artefacts concrets => le step n'est pas fait, retourner l'executer.
