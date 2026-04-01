---
name: changelog
description: "Generate a user-facing changelog from git history between the two most recent version bumps, then optionally post it to Slack. This skill should be used when the user asks to 'generate changelog', 'write changelog', 'post changelog', 'release notes', 'what changed since last version', or mentions 'changelog to Slack'."
---

# Changelog Generator

Generate a themed, user-facing changelog from git commits between the last two version bumps. Optionally post to Slack.

## Workflow

### 1. Identify version range

Find the two most recent version bump commits:

```bash
git log --all --oneline --grep="bump version" | head -5
```

Extract the commit hashes. The changelog covers all commits between `{previous_bump}` and `{latest_bump}`.

If only one bump exists, cover from the initial commit to that bump.

### 2. List and analyze commits

```bash
git log --oneline {previous_bump}..{latest_bump}
```

For each commit, run `git show --stat {hash}` to understand scope, then `git show {hash}` for the actual diff content.

Extract per commit:
- Type (feat/fix/chore/refactor)
- Scope from conventional commit
- Files changed and stats
- User-visible behavior change (not implementation details)
- Skills/workflows affected
- Breaking change or not

### 3. Write changelog

Group changes **by theme**, not by commit. Multiple commits on the same topic merge into one section.

Structure:
- Lead with the most impactful changes
- Each section: bold title with emoji, description paragraph, bullet list of specifics
- Write in `communication_language` from workflow-context.md
- Focus on what changed for users, not how
- Flag breaking changes explicitly

Present the changelog to the user in the conversation for review.

### 4. Post to Slack (optional)

Only if the user requests it. Ask which conversation to target.

Find channel ID via `mcp__slack__channels_list` with `channel_types: "mpim,im,public_channel,private_channel"`.

#### Slack formatting rules (mrkdwn, NOT markdown)

- Bold: `*text*` — never `**text**`
- Italic: `_text_` — never `*text*`
- No `#` headings — use `*bold text*` on its own line instead
- No `---` horizontal rules — use empty lines
- No backticks inside bold/italic — close formatting before opening backtick
- Bullets: use `•` character, indent with two spaces for sub-bullets
- Emojis: `:emoji_name:` format
- No blockquotes for sections — `>` only for actual quotes
- Set `content_type` to `text/plain` (Slack mrkdwn is NOT markdown)
