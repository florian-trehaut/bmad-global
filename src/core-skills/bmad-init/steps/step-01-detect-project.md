# Step 01 — Detect Project Identity

**Goal:** Auto-detect project name, monorepo structure, package manager, Node version, and standard commands.

---

## 1. Read package.json

```bash
cat package.json 2>/dev/null
```

Extract:
- `name` → candidate project_name
- `version` → project version
- `workspaces` → monorepo indicator
- `scripts` → available commands (build, test, lint, format, typecheck)
- `engines.node` → Node version requirement

If no `package.json`: this may be a non-JS project. Note and continue.

## 2. Read CLAUDE.md

```bash
cat CLAUDE.md 2>/dev/null
```

Extract:
- Project name (usually in title or first paragraph)
- Coding conventions
- Existing commands documented
- Any issue prefix mentioned

## 3. Detect Monorepo

Check for monorepo indicators:

```bash
# Workspace config files
ls pnpm-workspace.yaml turbo.json nx.json lerna.json rush.json 2>/dev/null

# Workspace directories
ls -d apps/ packages/ libs/ services/ modules/ 2>/dev/null
```

If monorepo detected:
- List each workspace directory and its contents (1 level deep)
- Count services/packages

## 4. Detect Package Manager

Check lock files in order of specificity:

| Check | Package Manager |
|-------|----------------|
| `pnpm-lock.yaml` exists | pnpm |
| `yarn.lock` exists | yarn |
| `package-lock.json` exists | npm |
| `bun.lockb` exists | bun |

```bash
ls pnpm-lock.yaml yarn.lock package-lock.json bun.lockb 2>/dev/null
```

Refer to `../data/detection-patterns.md` for command mappings.

## 5. Infer Commands

Based on package manager + `package.json` scripts, infer:

| Command | Source |
|---------|--------|
| install_command | Package manager default |
| build_command | `scripts.build` or `scripts.affected:build` (monorepo) |
| test_command | `scripts.test` or `scripts.affected:test` (monorepo) |
| lint_command | `scripts.lint` |
| format_command | `scripts.format:check` or `scripts.format` |
| typecheck_command | `scripts.typecheck` or `scripts.tsc` |
| quality_gate | Combine: typecheck + test + lint + format |

For monorepo projects, prefer `affected:*` variants if they exist in scripts.

## 6. Detect Node Version

```bash
cat .nvmrc 2>/dev/null || cat .node-version 2>/dev/null
```

Also check `package.json` → `engines.node`.

## 7. Detect Application Type

Determine what kind of output this project produces:

```bash
# Desktop app signals
# Rust with GUI framework
grep -q "gpui\|iced\|druid\|egui\|gtk\|slint" Cargo.toml 2>/dev/null && echo "desktop:rust-gui"
# Electron
grep -q '"electron"' package.json 2>/dev/null && echo "desktop:electron"
# Tauri
ls tauri.conf.json src-tauri/tauri.conf.json 2>/dev/null && echo "desktop:tauri"
# Flutter
grep -q "flutter" pubspec.yaml 2>/dev/null && echo "desktop:flutter"
# Swift/macOS
ls *.xcodeproj *.xcworkspace 2>/dev/null && echo "desktop:swift"

# CLI signals (binary without GUI)
grep -q '\[\[bin\]\]' Cargo.toml 2>/dev/null && echo "cli:rust"
ls go.mod 2>/dev/null && echo "cli:go"

# Library signals
grep -qP '^\[lib\]' Cargo.toml 2>/dev/null && ! grep -q '\[\[bin\]\]' Cargo.toml 2>/dev/null && echo "library:rust"

# Web signals (catch-all if no desktop/CLI detected)
ls next.config.* nuxt.config.* vite.config.* angular.json 2>/dev/null && echo "web:frontend"
ls nest-cli.json 2>/dev/null && echo "web:backend"
```

Classify into ONE of: `desktop`, `web`, `cli`, `library`. If multiple signals, prioritize `desktop` > `cli` > `web` > `library`.

If `app_type = desktop`, also detect:
- **app_binary_path**: where the compiled binary lives (e.g., `target/release/{name}`, `dist/{AppName}`, `src-tauri/target/release/{name}`)
- **app_log_dir**: where the app writes logs (platform + framework convention, e.g., `~/Library/Logs/{AppName}` on macOS)
- **app_platforms**: target platforms (from build scripts, CI config, Cargo targets, etc.)

## 8. Ask User

Present detected values and ask for confirmation/correction:

- **project_name**: detected from package.json/CLAUDE.md, or ask
- **issue_prefix**: suggest uppercase abbreviation of project name (e.g., "RewardPulse" → "REW")
- **communication_language**: ask (Francais, English, etc.)
- **user_name**: ask
- **user_skill_level**: ask (beginner, intermediate, expert)

---

## CHECKPOINT

Present all detected values in a summary table:

```
Project:          {project_name}
App type:         {desktop|web|cli|library}
Issue prefix:     {issue_prefix}
Monorepo:         yes/no ({count} apps, {count} packages, {count} libs)
Package manager:  {pnpm|yarn|npm|bun|cargo|go|etc.}
Node version:     {version or N/A}
Commands:
  install:        {install_command}
  build:          {build_command}
  test:           {test_command}
  lint:           {lint_command}
  format:         {format_command}
  typecheck:      {typecheck_command}
  quality_gate:   {quality_gate}
User:             {user_name} ({user_skill_level})
Language:         {communication_language}
```

Ask user: "Does this look correct? Any corrections?"

**Store all confirmed values for step-06 (context generation).**

---

**Next:** Read and follow `./steps/step-02-detect-tracker.md`
