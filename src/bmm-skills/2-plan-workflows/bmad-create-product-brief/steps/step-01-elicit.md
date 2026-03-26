# Step 01: Elicit Product Brief Content

## STEP GOAL

Guide the user through an interactive product brief creation covering 6 sections: Vision, Users, Metrics, Scope, Risks, and Summary. Produce a structured brief document.

## RULES

- Never invent or assume requirements — always ask
- Challenge vague statements — push for specificity
- Each section requires user input before proceeding
- Use the user's words — rephrase for clarity but preserve intent

## SEQUENCE

### 1. Vision & Problem

Ask: "Décrivez le produit ou la feature que vous souhaitez créer. Quel problème résout-il ? Pour qui ?"

WAIT for user response.

Follow up if vague:
- "Qu'est-ce qui se passe aujourd'hui sans cette solution ?"
- "Comment mesurez-vous le succès ?"

Structure into:
- **Vision statement**: one sentence
- **Problem statement**: what exists today and why it's insufficient
- **Proposed solution**: high-level description

### 2. Target Users & Personas

Ask: "Qui sont les utilisateurs principaux ? Décrivez 2-3 personas avec leurs besoins."

WAIT for user response.

For each persona, capture:
- Role / profile
- Primary needs
- Current pain points
- Expected benefit from the solution

### 3. Success Metrics

Ask: "Comment saurez-vous que cette initiative est un succès ? Donnez 3-5 métriques mesurables."

WAIT for user response.

For each metric, ensure it is SMART:
- Specific (what exactly)
- Measurable (how to measure)
- Target value (what "success" looks like)

### 4. Scope & Boundaries

Ask: "Qu'est-ce qui est IN scope et OUT of scope ? Y a-t-il des contraintes techniques, budget, ou calendrier ?"

WAIT for user response.

Structure into:
- **In scope**: features/capabilities included
- **Out of scope**: explicitly excluded
- **Constraints**: technical, budget, timeline, regulatory

### 5. Risks & Dependencies

Ask: "Quels sont les risques majeurs ? Y a-t-il des dépendances externes (APIs tierces, équipes, validations légales) ?"

WAIT for user response.

### 6. Compile brief document

Compile all sections into a structured markdown document:

```markdown
# Product Brief: {title}

**Date**: {current_date}
**Author**: {USER_NAME}

## Vision
{vision_statement}

## Problem
{problem_statement}

## Proposed Solution
{solution_description}

## Target Users
{personas}

## Success Metrics
{metrics_table}

## Scope
### In Scope
{in_scope}
### Out of Scope
{out_of_scope}
### Constraints
{constraints}

## Risks & Dependencies
{risks}
```

### 7. CHECKPOINT

Present the complete brief to the user:

"Voici le brief complet. Des corrections avant de le sauvegarder dans le tracker ?"

WAIT for user confirmation or corrections. Apply any corrections.

---

**Next:** Read fully and follow `./step-02-save.md`
