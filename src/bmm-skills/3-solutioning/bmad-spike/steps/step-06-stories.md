---
nextStepFile: './step-07-publish.md'
---

# Step 6: Create Informed Stories

## STEP GOAL:

Extract implementation stories from the spike findings. Create tracker issues that reference the spike deliverable and carry forward the decisions, constraints, and context discovered during investigation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- CRITICAL: Read the complete step file before taking any action
- CRITICAL: When loading next step with 'C', ensure entire file is read
- If any instruction references a subprocess or tool you do not have access to, achieve the outcome in your main context thread

### Role Reinforcement:

- Stories are seeds, not full specs — they carry the spike context into the backlog
- Each story must be grounded in spike evidence, not invented
- Stories go through quick-spec for full specification before implementation

### Step-Specific Rules:

- Only create stories the user explicitly approves
- Every story must reference the spike deliverable
- Stories inherit decisions and constraints from the spike
- HALT on tracker API failure — no silent fallback
- Auto-proceed after story creation

## EXECUTION PROTOCOLS:

- Follow MANDATORY SEQUENCE exactly
- Save WIP file before auto-proceeding
- Auto-proceed to next step

---

## MANDATORY SEQUENCE

### 1. Extract Story Candidates

From the deliverable's Follow-up Actions and Recommendation, identify discrete implementation stories:

- Each story should be a single, implementable unit of work
- Stories must be grounded in spike findings (not invented)
- Stories inherit constraints/decisions discovered during the spike
- For GO WITH CAVEATS verdicts: include caveat-resolution as explicit stories

Present candidates:

> ## Stories from Spike Findings
>
> | # | Story Title | Type | Rationale (from spike) |
> |---|-------------|------|------------------------|
> | 1 | {title} | {feature/task/spike} | {which finding/KAC this addresses} |
> | 2 | {title} | {type} | {rationale} |
> | 3 | {title} | {type} | {rationale} |
>
> **Note:** These are backlog seeds. Each will need full specification via quick-spec before implementation.

### 2. User Selection

> Which stories should I create? (comma-separated numbers, 'all', or 'none')

WAIT for input.

- **'none'**: Skip to step 5 (no stories to create is a valid outcome)
- **'all'**: Create all proposed stories
- **Numbers**: Create only the selected stories

### 3. Compose Story Descriptions

For each selected story, load `../templates/spike-story-template.md` and compose:

- **Title**: Clear, action-oriented
- **Context**: Reference to the spike — "Informed by Spike: {title} ({SPIKE_ISSUE_IDENTIFIER or slug})"
- **Relevant spike findings**: Excerpt of the specific findings relevant to this story
- **Decisions made during spike**: Concrete decisions this story must honor
- **Constraints discovered**: Limitations, dependencies, caveats from the investigation
- **Initial scope**: In/out boundaries from spike findings
- **Initial acceptance criteria**: Rough ACs to be refined by quick-spec

**Important:** These are NOT full specs. They carry enough context for backlog prioritization and for quick-spec to build on. Do not duplicate the full spec workflow here.

### 4. Create Tracker Issues

For each story:

```
{TRACKER_MCP_PREFIX}save_issue(
  title: '{title}',
  team: '{TRACKER_TEAM}',
  description: '{composed_description}',
  priority: 3,
  labels: ['spike-informed'],
  state: '{TRACKER_STATES.backlog}'
)
```

If a related epic/project exists (from Step 1 context): assign the story to that project.

Store created issue IDs and identifiers for the summary.

**If creation fails for any story:** HALT — report error, do NOT silently fallback to local file.

Link each created story to the spike issue (if `SPIKE_ISSUE_ID` is not null):

```
{TRACKER_MCP_PREFIX}create_issue_relation(
  issueId: '{NEW_STORY_ID}',
  relatedIssueId: '{SPIKE_ISSUE_ID}',
  type: 'blocked'
)
```

### 5. Update WIP

Append created stories list (identifiers, titles, links) to WIP. Update `stepsCompleted`.

### 6. Auto-Proceed

Load, read entire file, then execute {nextStepFile}.

---

## SYSTEM SUCCESS/FAILURE METRICS

### SUCCESS:

- Story candidates extracted from evidence (not invented)
- User confirmed which stories to create
- Each story references the spike deliverable
- Each story carries forward relevant decisions and constraints
- Tracker issues created with spike-informed label
- Stories linked to spike issue (blocking relationship)
- WIP updated with story list

### FAILURE:

- Creating stories not grounded in spike findings
- Creating issues without user confirmation
- Silent fallback on API failure
- Stories that are full specs (that's quick-spec's job)
- Missing spike reference in story description
