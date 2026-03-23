# Step 03: Save Retrospective Document

## STEP GOAL

Compile the full retrospective analysis into a structured document, save it as a Linear Document in the Meta Project, and report completion to the user.

## RULES

- HALT on Linear write failure — never silently fallback
- Document title must follow the convention: `Retrospective: {PROJECT_NAME}`
- Check for existing document before creating (update if exists)
- The document must be self-contained — readable without access to the conversation

## SEQUENCE

### 1. Compile the retrospective document

Assemble the complete document using this structure:

```markdown
# Retrospective: {PROJECT_NAME}

**Date:** {current date}
**Facilitator:** {USER_NAME}

---

## Métriques

| Métrique | Valeur |
|----------|--------|
| Issues totales | {N} |
| Issues terminées | {N} |
| Issues annulées | {N} |
| Taux de complétion | {N}% |
| Issues bloquées | {N} |
| Commits | {N} |

### Répartition par statut

{breakdown table}

---

## 1. Gestion du Scope

### Scope original vs livré
{analysis from step 02}

### Ajouts non planifiés
{list of added stories with context}

### Stories abandonnées
{list of dropped stories with reasons}

### Discipline scope
{rating and justification}

---

## 2. Qualité du Process

### Qualité des stories
{findings}

### Revue de code
{review thoroughness findings}

### Blocages
{blocked issues analysis with causes and resolutions}

### Fluidité du flux
{flow efficiency findings}

---

## 3. Qualité Technique

### Activité code
{git metrics}

### Hotspots
{most modified files}

### Conformité architecture
{architecture compliance findings}

### Tests et bugs
{test/bug findings}

---

## 4. Leçons apprises

### Ce qui a bien fonctionné
{3-5 items with evidence}

### Ce qui doit être amélioré
{3-5 items with evidence and recommendations}

### Actions pour le prochain epic
{2-4 concrete action items}

---

## Comparaison avec la rétrospective précédente

{If previous retro existed: recurring themes, resolved items, new issues}
{If no previous retro: "Première rétrospective — servira de baseline."}
```

### 2. Check for existing retrospective document

Search for an existing document with the same title in the Meta Project:

```
{TRACKER_MCP_PREFIX}list_documents(projectId: "{TRACKER_META_PROJECT_ID}")
```

Look for a document titled `Retrospective: {PROJECT_NAME}`.

### 3. Save or update the document

If a matching document exists:
```
{TRACKER_MCP_PREFIX}update_document(id: existing_doc_id, content: retrospective_content)
```

If no matching document:
```
{TRACKER_MCP_PREFIX}create_document(title: "Retrospective: {PROJECT_NAME}", project: "{TRACKER_META_PROJECT}", content: retrospective_content)
```

If the Linear write fails: **HALT** — report the error to the user. The retrospective content is still available in the conversation.

### 4. Report completion

Present:

```
Rétrospective terminée

- Epic : {PROJECT_NAME}
- Document Linear : Retrospective: {PROJECT_NAME}
- Issues analysées : {total_issues}
- Taux complétion : {done_count}/{total_issues} ({percentage}%)

Points clés :
  1. {key takeaway 1}
  2. {key takeaway 2}
  3. {key takeaway 3}

Actions pour le prochain epic :
  1. {action item 1}
  2. {action item 2}
```

---

## END OF WORKFLOW

The bmad-retrospective workflow is complete.
