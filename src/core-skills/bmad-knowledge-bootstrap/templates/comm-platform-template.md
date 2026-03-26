# Communication Platform — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Team communication platform patterns. -->

## Platform Type

<!-- Which platform was detected: Slack, Teams, Discord, or none. Include the interface type (MCP, CLI, API). -->

## Tool Interface

<!-- How to call the platform. Fill the detected interface: -->

<!-- MCP-based: prefix for MCP tool calls (e.g., mcp__slack__) -->
<!-- CLI-based: CLI command and auth -->
<!-- none: no communication platform configured — workflows skip comm steps -->

## User Handle

<!-- The authenticated user's handle on the platform (e.g., @florian). Used for searching user activity. -->

## CRUD Operations

<!-- Concrete tool calls for each operation. Step files reference this table instead of hardcoding tool calls. -->

| Operation | Method |
|---|---|
| List channels | {concrete call for detected backend} |
| Search messages from user | {concrete call} |
| Search messages mentioning user | {concrete call} |
| Search DMs from user | {concrete call} |
| Search DMs to user | {concrete call} |
| Read channel history | {concrete call} |
| Read thread replies | {concrete call} |

## HALT Policy

<!-- Communication platform is always optional. If unavailable: log a warning and skip — do NOT HALT. -->
