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

#### 2.1 CHANGELOG.md gap detection

Compare all git tags against entries already in `CHANGELOG.md` — any tagged version missing from CHANGELOG.md is a documentation gap that should be acknowledged before we add the new entry on top.

```bash
GIT_VERSIONS=$(git tag | grep -E "^v[0-9]+\.[0-9]+\.[0-9]+$" | sort -V)
CHANGELOG_VERSIONS=$(grep -oE "^## v[0-9]+\.[0-9]+\.[0-9]+" CHANGELOG.md | sed 's/^## //' | sort -V)
MISSING=$(comm -23 <(echo "$GIT_VERSIONS") <(echo "$CHANGELOG_VERSIONS"))
```

If `MISSING` is non-empty, present the list and ask:

- **[B]ackfill** — generate entries for the missing versions from their commit ranges, prepend them to CHANGELOG.md **before** the new entry (keeps history complete)
- **[I]gnore** — proceed with the current release only (leaves the gap)
- **[H]alt** — abort so the user can fix history manually

No default. WAIT for input.

### 3. List and analyze commits

```bash
git log --oneline {previous_bump}..HEAD
```

For each commit, run `git show --stat {hash}` to understand scope, then `git show {hash}` for the actual diff content.

Extract per commit:

- Type (feat/fix/chore/refactor)
- Scope from conventional commit
- Files changed and stats (`files_changed`, `lines_added + lines_removed`)
- User-visible behavior change (not implementation details)
- Skills/workflows affected
- Breaking change or not

#### 3.1 Post-upgrade commands discovery

Identify commands downstream consumers need to run **after** installing this release (bootstrap, migration, knowledge refresh, cache prime, etc.). These go into the Slack post and a `## Post-upgrade` subsection of the changelog entry.

Discovery sources (apply all that exist, in order):

1. `workflow-context.md` frontmatter key `post_install_commands` (array of `{command, when}` pairs, where `when` ∈ `always | after_minor | after_major | breaking_only`).
2. Changed skill files in the range — any skill whose `name` matches `*-bootstrap`, `*-refresh`, `*-migrate`, `*-init` is a candidate post-install entry point. Propose its invocation as `/skill-name`.
3. If step 3 analysis flagged a breaking change and no `post_install_commands` covers it, prompt the user for a one-line post-upgrade recipe.

Store as `POST_UPGRADE_COMMANDS` (list of `{command, description}`). An empty list is valid — skip the section entirely in that case.

### 4. Determine version bump type

Based on the analyzed commits, propose a bump type:

| Condition | Bump |
|-----------|------|
| Any breaking change | **major** |
| Any `feat` commit | **minor** |
| Only `fix`, `chore`, `refactor`, `docs` | **patch** |

Present: "Proposed bump: **{type}** ({current_version} → {new_version})"

HALT — ask user to confirm or override: `[P]atch / [Mi]nor / [Ma]jor / [C]ustom version`. No default — wait for explicit input.

### 5. Write changelog

Group changes **by theme**, not by commit. Multiple commits on the same topic merge into one section.

#### 5.1 Language

Write in `document_output_language` from `workflow-context.md` — CHANGELOG.md is a written artifact, not an interactive message. If `document_output_language` is not set in the frontmatter, fall back to `communication_language`.

Apply the same rule to the Slack post in step 10, for consistency across release artifacts.

#### 5.2 Impact-weighted theme ordering

For each theme, compute:

```
impact_score(theme) = sum_over_commits(
  lines_changed × files_changed × (10 if breaking else 1)
)
```

Sort themes by `impact_score` descending.

- The top theme opens the changelog with a distinct heading (e.g. `### 🔥 Highlight: {theme}`) and gets the full detail treatment (sub-sections, tables, lists).
- Themes with `impact_score >= 0.1 × max_score` get standard headings with bullet lists.
- Themes with `impact_score < 0.1 × max_score` are grouped under a compact `### Other changes` section with one-line entries.

This replaces the prior "lead with the most impactful changes" instruction with a concrete ordering rule that can be applied deterministically.

#### 5.3 Structure

- Each section: bold title with emoji, description paragraph, bullet list of specifics.
- Focus on what changed for users, not how.
- Flag breaking changes explicitly with `⚠️ BREAKING:` prefix on the affected bullets.
- Append `## Post-upgrade` subsection if `POST_UPGRADE_COMMANDS` is non-empty (step 3.1). Format as a numbered list with command + rationale.

#### 5.4 Review gate

Present the changelog to the user in the conversation.

⚠️ Remind the user: **"If you plan to post this to Slack, the message will be immutable — the Slack MCP does not support editing. Review carefully now."**

HALT — ask: `[A]ccept / [E]dit / [R]eject`. No default.

- **A**: Proceed.
- **E**: Apply corrections, re-present, loop until A or R.
- **R**: HALT — abort the entire release.

### 6. Update CHANGELOG.md

Prepend the new version section to `CHANGELOG.md`:

```markdown
## v{new_version} - {YYYY-MM-DD}

{approved changelog content}
```

Insert after the `# Changelog` heading and before the previous version entry. Do NOT remove existing entries.

If `CHANGELOG.md` does not exist, create it with `# Changelog` heading.

If step 2.1 produced backfill entries, prepend them **above** the current release entry so the order is: new release → backfilled gap entries (chronological) → existing entries.

### 7. Bump version

Update `package.json` version field:

```bash
npm version {bump_type} --no-git-tag-version
```

`--no-git-tag-version` because we create the commit and tag ourselves with a meaningful commit message.

### 7.5 Pre-push tarball sanity check

Before committing, verify the tarball that CI will publish is not accidentally shipping project-local files (worktrees, node_modules, .git, build artifacts). Catching this locally avoids a failed CI run + force-retag dance.

```bash
npm pack --dry-run 2>&1 | tee /tmp/pack-dryrun.log
SIZE_MB=$(grep "package size" /tmp/pack-dryrun.log | grep -oE "[0-9.]+\s*[kMG]B" | tail -1)
FILE_COUNT=$(grep "total files" /tmp/pack-dryrun.log | awk '{print $4}')
BAD=$(grep -E "(\.claude/worktrees/|/node_modules/|^npm notice \.git/|/\.DS_Store|/coverage/)" /tmp/pack-dryrun.log || true)
```

HALT conditions:

| Signal | HALT message |
|--------|--------------|
| `BAD` non-empty | "Tarball contains project-local files that should be excluded: {BAD}. Fix `.npmignore` before pushing." |
| `FILE_COUNT > 5000` | "Tarball has {FILE_COUNT} files — suspiciously large. Review `.npmignore` vs `package.json` `files` field." |
| `SIZE_MB > 50 MB` | "Tarball is {SIZE_MB} — over the 50 MB sanity threshold. Investigate." |

If all checks pass, present a one-line summary: `"Tarball OK: {SIZE_MB}, {FILE_COUNT} files, no suspicious entries."`

### 8. Commit, tag, and push

Create a single commit with both changes, then tag it:

```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to {new_version}"
git tag "v{new_version}"
```

HALT — present commit summary and ask: "Push to origin? The `Publish` workflow will run on the tag and release to npm. `[Y]es / [N]o`". No default.

ℹ️ **Provenance note**: The `Publish` workflow uses `npm publish --provenance`, which requires `.github/workflows/publish.yaml` to remain at that exact path. If the workflow file is renamed or moved, the trusted publisher configuration on npmjs.com must be updated **before** the next release, otherwise publish will fail with an OIDC authentication error.

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

If it succeeds, verify publication:

```bash
npm view @florian-trehaut/bmad-global@{new_version} version
```

Log: "Published @florian-trehaut/bmad-global@{new_version} to npm via CI."

Proceed to step 10.

#### 9.5 CI failure triage

If `gh run watch` exited non-zero, fetch the failed step logs and match against known failure modes before asking the user to intervene blind.

```bash
RUN_ID=$(gh run list --workflow=publish.yaml --limit 1 --json databaseId -q '.[0].databaseId')
gh run view "$RUN_ID" --log-failed 2>&1 | tail -100 > /tmp/ci-failure.log
```

Triage table:

| Signal in log | Likely cause | Recommended recovery |
|---------------|--------------|----------------------|
| `Tag/package.json mismatch` | Version coherence check | `[P]atch bump` — new version, new tag |
| `npm ERR! code EPUBLISHFAIL` + large tarball | `.npmignore` misconfigured | `[F]ix + force-retag` after fixing `.npmignore` |
| `npm ERR! 403 Forbidden` or `OIDC` errors | Trusted publisher not configured | Link user to `https://www.npmjs.com/settings/florian-trehaut/packages` — fix config, then `[W]orkflow replay` |
| `npm test` failure | Regression between commit and CI | `[F]ix + force-retag` after local fix + `npm test` green |
| `gh release create` error | Token / permission issue or duplicate release | Check `GITHUB_TOKEN` scope, delete conflicting release, `[W]orkflow replay` |
| Other / unknown | Unclassified | Report URL to user, ask for guidance |

Present the matched row(s) + the last 30 lines of the failed log to the user.

#### 9.6 Recovery menu

```
Release fix menu:
  [F]ix + force-retag — create fix commit, delete + recreate tag v{new_version} at new commit,
                        force-push tag → triggers CI via tag push. No version bump.
  [P]atch bump       — create fix commit, `npm version patch`, new tag, push.
                        Clean history, version increments. Use when version coherence failed
                        or the fix is non-trivial.
  [W]orkflow replay  — no code change, re-trigger the existing tag via
                        `gh workflow run publish.yaml --ref v{new_version}`.
                        Only useful for transient CI flakes (network, rate limits).
  [A]bort            — leave the state as-is, user handles manually.
```

No default. WAIT for explicit input.

- **F**: Guide the user through the fix commit, then:
  ```bash
  git tag -d v{new_version}
  git push origin :refs/tags/v{new_version}
  git tag v{new_version}
  git push origin v{new_version}
  ```
  Loop back to step 9 (watch the workflow).
- **P**: Run step 7 (bump) + step 7.5 (tarball check) + step 8 (commit/tag/push) with the new patch version. Loop back to step 9.
- **W**: `gh workflow run publish.yaml --ref v{new_version}`. Loop back to step 9.
- **A**: HALT — summary of partial state, user handles.

### 10. Post to Slack (optional)

Ask the user: "Post changelog to Slack? `[Y]es / [N]o`"

#### 10.0 Slack capability probe

Before asking the user to pick a channel, probe the Slack MCP server for write capability:

```
Call: mcp__slack__channels_list(channel_types="public_channel", limit=1)
```

Interpret the response:

- **Success** (returns a row): write capability likely enabled. Proceed to channel selection.
- **Error mentioning `SLACK_MCP_ADD_MESSAGE_TOOL`**: the write tool is gated. Present:

  > The Slack MCP server is running but `conversations_add_message` is disabled by default for safety. To enable it, set `SLACK_MCP_ADD_MESSAGE_TOOL` in `~/.claude/settings.json` (under `env`), then restart Claude Code.
  >
  > Options:
  > - **[F]ix config** — I apply the settings.json edit; you restart Claude Code and come back
  > - **[M]anual copy-paste** — I render the Slack-formatted text; you paste it yourself
  > - **[S]kip Slack** — abandon the Slack post for this release

  No default.

- **Other error** (auth, network): report verbatim to the user, propose `[M]anual copy-paste` or `[S]kip Slack`.

#### 10.1 Channel selection

If capability probe succeeded and the user wants to post, ask which conversation.

Find channel ID via `mcp__slack__channels_list` with `channel_types: "mpim,im,public_channel,private_channel"`.

#### 10.2 Slack post template

Post a structured message using the mrkdwn template below. Each section is either always present (★) or conditional on data availability.

```
★ Header   : :package: *{package_name} {new_version} published on {registry}*
             {registry_url}

★ Install  : *Install / update*
               • Global : `{global_install_command}`
               • Interactive : `{interactive_install_command}`

◇ Post-upgrade (only if POST_UPGRADE_COMMANDS non-empty from step 3.1):
             *Post-upgrade commands*
               • `/{command_1}` — {description_1}
               • `/{command_2}` — {description_2}

★ Highlight (top theme from impact-weighted ordering 5.2):
             :fire: *{top_theme_title}*
             {1-2 sentence teaser}
               • {bullet 1}
               • {bullet 2}
               • {bullet 3-5}

◇ Other    (themes with impact_score ≥ 10% of max, compact form):
             *Other changes*
               • {theme 2}: {one-line summary}
               • {theme 3}: {one-line summary}

★ Link     : Full changelog: {changelog_url}
```

Legend: ★ = always include, ◇ = conditional.

Derive commands and URLs automatically:

- `{global_install_command}` = `npm install -g {package_name}`
- `{interactive_install_command}` = `npx {package_name} install` (if the package exposes an `install` CLI; otherwise omit this bullet)
- `{registry_url}` = `https://www.npmjs.com/package/{package_name}`
- `{changelog_url}` = `https://github.com/{forge_project_path}/blob/main/CHANGELOG.md`

#### 10.3 Slack formatting rules (mrkdwn, NOT markdown)

- Bold: `*text*` — never `**text**`
- Italic: `_text_` — never `*text*`
- No `#` headings — use `*bold text*` on its own line instead
- No `---` horizontal rules — use empty lines
- No backticks inside bold/italic — close formatting before opening backtick
- Bullets: use `•` character, indent with two spaces for sub-bullets
- Emojis: `:emoji_name:` format
- No blockquotes for sections — `>` only for actual quotes
- Escape HTML entities: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`
- Set `content_type` to `text/plain` (Slack mrkdwn is NOT markdown)

### 11. Summary

Present a final release summary:

```
Release complete:
  Version:   {previous_version} → {new_version}
  Commit:    {short_hash}
  Tag:       v{new_version}
  Tarball:   {size}, {file_count} files
  CI:        {run_url} → success
  npm:       {package_name}@{new_version} (provenance attested)
  GitHub:    Release created at {release_url}
  Slack:     {posted to #channel / skipped / manual copy / skipped on probe failure}
```
