---
name: changelog
description: "Generate a user-facing changelog from git history between the two most recent version bumps, then bump version, commit, tag, push. npm publish + GitHub Release are handled by the `Publish` GitHub Actions workflow on tag push. Optionally post to Slack. This skill should be used when the user asks to 'generate changelog', 'write changelog', 'post changelog', 'release notes', 'what changed since last version', 'publish', 'release', 'bump version', or mentions 'changelog to Slack'."
---

# Changelog & Release

Generate a themed, user-facing changelog from git commits since the last version bump, write it to CHANGELOG.md, bump version, commit, tag, push. The `Publish` workflow (`.github/workflows/publish.yaml`) takes over on the tag push and runs `npm publish` via OIDC trusted publishing plus `gh release create`. Optionally post to Slack.

## Workflow

### 1. Pre-flight checks

Verify the workspace is clean and ready for a release:

```bash
git status --porcelain
```

If there are uncommitted changes: HALT — "Uncommitted changes detected. Commit or stash before releasing."

Verify we are on `main`:

```bash
git branch --show-current
```

If not on `main`: HALT — "Releases must be done from the `main` branch."

### 2. Identify version range

Find the two most recent version bump commits:

```bash
git log --all --oneline --grep="bump version" | head -5
```

Extract the commit hashes. The changelog covers all commits between `{previous_bump}` and `HEAD` (not latest_bump — we want unreleased changes).

Read current version from package.json:

```bash
node -p "require('./package.json').version"
```

If no commits exist between `{previous_bump}` and HEAD: HALT — "No unreleased commits found since v{current_version}."

### 3. List and analyze commits

```bash
git log --oneline {previous_bump}..HEAD
```

For each commit, run `git show --stat {hash}` to understand scope, then `git show {hash}` for the actual diff content.

Extract per commit:
- Type (feat/fix/chore/refactor)
- Scope from conventional commit
- Files changed and stats
- User-visible behavior change (not implementation details)
- Skills/workflows affected
- Breaking change or not

### 4. Determine version bump type

Based on the analyzed commits, propose a bump type:

| Condition | Bump |
|-----------|------|
| Any breaking change | **major** |
| Any `feat` commit | **minor** |
| Only `fix`, `chore`, `refactor`, `docs` | **patch** |

Present: "Proposed bump: **{type}** ({current_version} → {new_version})"

HALT — ask user to confirm or override: `[P]atch / [Mi]nor / [Ma]jor / [C]ustom version`

### 5. Write changelog

Group changes **by theme**, not by commit. Multiple commits on the same topic merge into one section.

Structure:
- Lead with the most impactful changes
- Each section: bold title with emoji, description paragraph, bullet list of specifics
- Write in `communication_language` from workflow-context.md
- Focus on what changed for users, not how
- Flag breaking changes explicitly

Present the changelog to the user in the conversation for review.

HALT — ask: `[A]ccept / [E]dit / [R]eject`

- **A**: Proceed
- **E**: Apply corrections, re-present, loop until A or R
- **R**: HALT — abort the entire release

### 6. Update CHANGELOG.md

Prepend the new version section to `CHANGELOG.md`:

```markdown
## v{new_version} - {YYYY-MM-DD}

{approved changelog content}
```

Insert after the `# Changelog` heading and before the previous version entry. Do NOT remove existing entries.

If `CHANGELOG.md` does not exist, create it with `# Changelog` heading.

### 7. Bump version

Update `package.json` version field:

```bash
npm version {bump_type} --no-git-tag-version
```

`--no-git-tag-version` because we create the commit and tag ourselves with a meaningful commit message.

### 8. Commit, tag, and push

Create a single commit with both changes, then tag it:

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to {new_version}"
git tag "v{new_version}"
```

HALT — present commit summary and ask: "Push to origin? The `Publish` workflow will run on the tag and release to npm. `[Y]es / [N]o`"

If **Y**:

```bash
git push origin main --follow-tags
```

The tag push triggers `.github/workflows/publish.yaml`, which runs tests, publishes to npm via OIDC trusted publishing, and creates the GitHub Release from the CHANGELOG section.

If **N**: inform user the commit and tag are local, they can push manually later (`git push origin main --follow-tags`). Skip step 9.

### 9. Watch the publish workflow

```bash
gh run watch --repo florian-trehaut/bmad-global --exit-status
```

This blocks until the latest workflow run finishes. Exit status is non-zero if the run failed.

If it fails: HALT — report the run URL. The tag is already pushed; the user can replay the workflow via `gh workflow run publish.yaml --ref v{new_version}` after fixing the root cause, or re-run from the GitHub UI.

If it succeeds, verify publication:

```bash
npm view @florian-trehaut/bmad-global@{new_version} version
```

Log: "Published @florian-trehaut/bmad-global@{new_version} to npm via CI."

### 10. Post to Slack (optional)

Ask the user: "Post changelog to Slack? `[Y]es / [N]o`"

If **Y**: ask which conversation to target.

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

### 11. Summary

Present a final release summary:

```
Release complete:
  Version:   {previous_version} → {new_version}
  Commit:    {short_hash}
  Tag:       v{new_version}
  npm:       published via CI (run: {run_url})
  Slack:     {posted to #channel / skipped}
```
