# Step 03 — Detect Source Code Forge

**Goal:** Auto-detect the source code forge (GitLab, GitHub, Bitbucket), CLI tools, and project path.

---

## 1. Read Git Remote URL

```bash
git remote get-url origin 2>/dev/null
```

Parse the URL to determine forge type:

| URL Contains | Forge |
|-------------|-------|
| `gitlab.com` or `gitlab` | GitLab |
| `github.com` or `github` | GitHub |
| `bitbucket.org` or `bitbucket` | Bitbucket |
| `dev.azure.com` | Azure DevOps |

Extract the project path from the URL:
- SSH format: `git@gitlab.com:org/repo.git` → `org/repo`
- HTTPS format: `https://gitlab.com/org/repo.git` → `org/repo`
- Nested groups: `git@gitlab.com:org/subgroup/repo.git` → `org/subgroup/repo`

Strip trailing `.git` from the path.

Compute URL-encoded path (replace `/` with `%2F`): needed for API calls on GitLab.

## 2. Check CLI Tools

```bash
which glab 2>/dev/null && echo "glab found"
which gh 2>/dev/null && echo "gh found"
```

Verify authentication:

```bash
# GitLab
glab auth status 2>/dev/null

# GitHub
gh auth status 2>/dev/null
```

## 3. Set Forge Configuration

### If GitLab

```yaml
forge: gitlab
forge_project_path: "org/repo"
forge_project_path_encoded: "org%2Frepo"
forge_cli: glab
forge_mr_create: "glab mr create"
forge_mr_list: "glab mr list"
forge_mr_approve: "glab mr approve"
forge_api_base: "glab api"
```

### If GitHub

```yaml
forge: github
forge_project_path: "org/repo"
forge_cli: gh
forge_mr_create: "gh pr create"
forge_mr_list: "gh pr list"
forge_mr_approve: "gh pr review --approve"
forge_api_base: "gh api"
```

Note: GitHub uses "PR" (Pull Request) instead of "MR" (Merge Request). The config keys use `mr_` for consistency across forges.

### If Bitbucket

```yaml
forge: bitbucket
forge_project_path: "org/repo"
forge_cli: ""  # No standard CLI
forge_api_base: "https://api.bitbucket.org/2.0"
```

Bitbucket has limited CLI support. Note this as a limitation.

### If No Remote / Unknown

Ask user: "No git remote detected or forge not recognized. Which forge do you use?"
- GitLab
- GitHub
- Bitbucket
- None / Local only

## 4. Worktree Templates

Generate worktree naming templates based on the project name (from step-01):

```yaml
worktree_prefix: "{ProjectName}"
worktree_templates:
  dev: "../{ProjectName}-{issue_number}-{short_description}"
  review: "../{ProjectName}-review-{mr_iid}"
  spec_review: "../{ProjectName}-review-spec-{issue_number}"
  validation: "../{ProjectName}-validation-{issue_number}"
  quick_spec: "../{ProjectName}-spec-{slug}"
branch_template: "feat/{issue_number}-{short_description}"
```

Ask user if they want to customize the templates, or accept defaults.

---

## CHECKPOINT

Present the forge configuration:

```
Forge:            {type}
Project path:     {path}
Encoded path:     {encoded_path}
CLI tool:         {cli} (authenticated: yes/no)
MR create:        {command}
MR list:          {command}
Worktree prefix:  {prefix}
Branch template:  {template}
```

Ask user: "Does this look correct?"

**Store all confirmed values for step-06.**

---

**Next:** Read and follow `./steps/step-04-detect-stack.md`
