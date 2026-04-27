# Step 03: Create Tracker Projects and Issues

## STEP GOAL

Persist the validated epic and story structure into the project tracker by creating epics/projects and stories/issues (using concept mapping from `workflow-knowledge/project.md`) with all acceptance criteria, BDD scenarios, and test strategies in the issue descriptions. All stories are created in Backlog state.

## RULES

- HALT on any tracker write failure — never silently skip a creation
- Check for existing projects with the same name before creating duplicates
- Stories are ALWAYS created in Backlog state
- Issue descriptions must contain the full story content (ACs, BDD, test strategy, dependencies, estimation)
- Log every creation with its identifier for the report step

## SEQUENCE

### 1. Check for existing projects

Before creating epics as tracker projects, check if projects with the same names already exist.

Query the project tracker (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: List projects
- Filter: by team ID `{TRACKER_TEAM_ID}`

If a project with the same name exists, ask the user:

```
Le projet "{epic_name}" existe déjà dans le tracker.
1. Utiliser le projet existant (ajouter les stories dedans)
2. Créer un nouveau projet avec un suffixe
3. Annuler
```

WAIT for user decision.

### 2. Create tracker projects for epics

For each epic, create a tracker project.

Query the project tracker (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: Create project
- Fields:
  - name: `{epic_name}`
  - description: `{epic_description}\n\nScope: {epic_scope}\nDependencies: {epic_dependencies}`
  - team: `{TRACKER_TEAM_ID}`

Store the created project ID as `{EPIC_PROJECT_ID}` for use when creating stories.

Log: `Projet créé: {epic_name} (ID: {project_id})`

**HALT if creation fails:** "Échec de création du projet tracker '{epic_name}'. Erreur: {error}. Vérifiez les permissions et la connexion au tracker."

### 3. Create tracker issues for stories

For each story in each epic, compose the issue description with all sections:

```markdown
**En tant que** {persona},
**je veux** {action},
**afin de** {benefit}.

## Critères d'Acceptation

**AC1: {ac_title}**
\`\`\`gherkin
Given {precondition}
When {action}
Then {expected_result}
\`\`\`

**AC2: {ac_title}**
\`\`\`gherkin
Given {precondition}
When {action}
Then {expected_result}
\`\`\`

## Scénarios BDD additionnels

- **Cas d'erreur**: {error scenario}
- **Cas limite**: {edge case}

## Stratégie de Test

| AC | Priorité | Unit | Integration | Journey | Scénarios clés |
|----|----------|------|-------------|---------|----------------|
| AC1 | P{n} | {count} | {count} | {count} | {scenarios} |
| AC2 | P{n} | {count} | {count} | {count} | {scenarios} |

### Critères de qualité
- P0: couverture >90% unit, >80% integ, tous chemins critiques en journey
- P1: couverture >80% unit, >60% integ
- Pas de mock — InMemory fakes uniquement

## Dépendances
- {dependencies}

## Estimation
- {t_shirt_size}
```

Create the issue in the tracker.

Query the project tracker (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: Create issue
- Fields:
  - title: `{story_title}`
  - description: `{composed_description}`
  - team: `{TRACKER_TEAM_ID}`
  - project: `{EPIC_PROJECT_ID}`
  - state: Backlog (mapped via `workflow-knowledge/project.md` state mapping)

Log: `Issue créée: {identifier} — {story_title} [Backlog]`

**HALT if creation fails:** "Échec de création de l'issue '{story_title}'. Erreur: {error}."

### 4. Verify creation

After all issues are created, verify by listing issues in each project.

Query the project tracker (using CRUD patterns from `workflow-knowledge/project.md`):
- Operation: List issues
- Filter: by project ID `{EPIC_PROJECT_ID}`

Confirm the count matches expectations. If discrepancies exist, report them.

Store the full list of created items (projects and issues with identifiers) for the report step.

---

**Next:** Read fully and follow `./step-04-report.md`
