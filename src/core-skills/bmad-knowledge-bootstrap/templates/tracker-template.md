# Tracker — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Issue tracker patterns and conventions. -->

## Tracker Type

<!-- Which tracker type was detected: MCP-based, CLI-based, or file-based. Include the specific tool (e.g., Linear MCP, gh CLI, glab CLI, sprint-status.yaml). -->

## Tool Interface

<!-- How to call the tracker. Fill ONE of: -->

<!-- MCP-based: prefix for MCP tool calls (e.g., mcp__linear-server__, mcp__linear__) -->
<!-- CLI-based: CLI command and auth (e.g., gh issue list --repo org/repo) -->
<!-- File-based: file paths and format (e.g., read/write sprint-status.yaml) -->

## Concept Mapping

<!-- How BMAD concepts map to tracker entities. Fill with detected equivalents. -->

| BMAD Concept | Tracker Equivalent |
|---|---|
| Epic | {tracker's grouping entity} |
| Story | {tracker's work item entity} |
| Sprint | {tracker's time-boxed iteration entity} |
| Document | {tracker's document/page entity, if any} |

## State Machines

<!-- Valid states and transitions for epics and stories. Detected from workflow-context.md tracker_states. -->

## Story Key Format

<!-- How story identifiers are constructed. Naming conventions for issues/stories. -->

## CRUD Operations

<!-- Concrete tool calls or file operations for each operation. The knowledge-bootstrap fills these with the ACTUAL commands for the detected tracker backend. Step files reference this table instead of hardcoding tool calls. -->

| Operation | Method |
|---|---|
| List issues (filtered by team, status, assignee) | {concrete call for detected backend} |
| Get single issue by ID | {concrete call} |
| Create issue | {concrete call} |
| Update issue (status, description, assignee) | {concrete call} |
| List epics/projects | {concrete call} |
| Create epic/project | {concrete call} |
| List sprints/cycles | {concrete call} |
| Search issues by keyword | {concrete call} |
| Save/create document | {concrete call, or N/A} |

## HALT Policy

<!-- When tracker operations should cause a HALT vs. graceful degradation. -->
