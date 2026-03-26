---
generated: 2026-03-26
generator: bmad-knowledge-bootstrap
source_hash: 986162c8
---

# File-Based Tracker — Knowledge

## Tracker Type

File-based (`sprint-status.yaml`). No external tracker service.

## Concept Mapping

| BMAD Concept | File-Based Equivalent |
|---|---|
| Epic | `epic-{N}` entry in sprint-status.yaml |
| Story | `{epic_num}-{story_num}-{kebab-title}` entry in sprint-status.yaml |
| Story File | `{story_key}.md` in implementation-artifacts/ |
| Sprint | All entries in sprint-status.yaml (single sprint at a time) |
| Retrospective | `epic-{N}-retrospective` entry in sprint-status.yaml |
| Document | Markdown files in planning-artifacts/ |

## File Structure

### sprint-status.yaml

Location: `_bmad-output/implementation-artifacts/sprint-status.yaml`

```yaml
generated: 2026-03-22
last_updated: 2026-03-22
project: BMAD-METHOD
project_key: BMAD
tracking_system: file-system
story_location: _bmad-output/implementation-artifacts

development_status:
  epic-1: backlog
  1-1-story-slug: backlog
  1-2-another-story: backlog
  epic-1-retrospective: optional
  epic-2: backlog
  # ...
```

### State Machines

**Epic states:** `backlog` → `in-progress` → `done`

**Story states:** `backlog` → `ready-for-dev` → `in-progress` → `review` → `done`

**Retrospective states:** `optional` → `done`

### Auto-Detection Rules

- Story file exists at `{story_location}/{story_key}.md` → auto-upgrade to `ready-for-dev`
- Never downgrade a status
- Epic auto-upgrades to `in-progress` when first story is created

## Story Key Format

From epic definition `Story 1.2: User Authentication`:
1. Replace period with dash: `1-2`
2. Convert title to kebab-case: `user-authentication`
3. Final key: `1-2-user-authentication`

## Story Discovery

Always read sprint-status.yaml **top-to-bottom**. The first entry matching `{N}-{N}-{slug}` with status `backlog` is the next story to work on.

## Epic File Location

Planning artifacts: `_bmad-output/planning-artifacts/`

Supported formats:
- Single file: `epics.md`, `bmm-epics.md`, or any `*epic*.md`
- Sharded: `epics/index.md` + `epics/epic-{N}.md`

## CRUD Operations

| Operation | Method |
|---|---|
| Read sprint status | Read `_bmad-output/implementation-artifacts/sprint-status.yaml` |
| Update story status | Edit the YAML value for the story key |
| Create story file | Write `_bmad-output/implementation-artifacts/{story_key}.md` |
| Read epic definitions | Read `_bmad-output/planning-artifacts/epics.md` |
| Create retrospective | Write `_bmad-output/implementation-artifacts/epic-{N}-retro-{date}.md` |

## HALT Policy

No external dependencies — file-based tracker is always available. HALT only if sprint-status.yaml is malformed YAML.
