# Tracker — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Issue tracker patterns and conventions. -->

## Tracker Type

<!-- Which tracker: Linear, GitHub Issues, GitLab Issues, Jira, file-based (sprint-status.yaml). Detected from workflow-context.md. -->

## Concept Mapping

<!-- How BMAD concepts map to tracker entities. Table: BMAD Concept | Tracker Equivalent. -->

| BMAD Concept | Tracker Equivalent |
|---|---|
| Epic | {e.g., Linear Project, GitHub Milestone} |
| Story | {e.g., Linear Issue, GitHub Issue} |
| Sprint | {e.g., Linear Cycle, GitHub Project Board} |

## State Machines

<!-- Valid states and transitions for epics and stories. Detected from workflow-context.md tracker_states. -->

## Story Key Format

<!-- How story identifiers are constructed. Naming conventions for issues/stories. -->

## CRUD Operations

<!-- How to read/create/update tracker entities. MCP tool patterns or file operations. -->

| Operation | Method |
|---|---|
| List issues | {MCP call or file read pattern} |
| Create issue | {MCP call or file write pattern} |
| Update status | {MCP call or file edit pattern} |

## HALT Policy

<!-- When tracker operations should cause a HALT vs. graceful degradation. -->
