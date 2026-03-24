# Step 04: Completion Report

## STEP GOAL

Present a structured summary of all created Linear items (Projects and Issues) so the user has a clear view of the backlog and knows what to do next.

## RULES

- Report must list every created item with its Linear identifier
- Include counts and grouping by epic
- Suggest relevant next workflow steps

## SEQUENCE

### 1. Compile report

Present the following summary to the user:

```
Epics et Stories créés pour {SELECTED_PROJECT}

Projets Linear (Epics):
{for each epic}
  - {epic_name} (ID: {project_id})
{end}

Issues Linear (Stories):
{for each epic}
  {epic_name}:
  {for each story}
    - {identifier}: {story_title} [Backlog] — Test strategy incluse ({ac_count} ACs)
  {end}
{end}

Totaux:
  - Epics: {epic_count}
  - Stories: {story_count}
  - ACs totaux: {total_ac_count}

Prochaines étapes possibles:
  - "test design" — plan de test détaillé au niveau epic
  - "nfr assess" — évaluer les exigences non-fonctionnelles
  - "check readiness" — valider que tout est prêt pour l'implémentation
  - "sprint planning" — assigner les stories à un cycle
```

---

## END OF WORKFLOW

The bmad-create-epics-stories workflow is complete.
