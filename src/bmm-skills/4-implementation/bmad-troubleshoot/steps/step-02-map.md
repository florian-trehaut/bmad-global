# Step 2: Map the Terrain

## STEP GOAL

Load project context, discover available local skills, identify the affected service's infrastructure, and create a worktree for investigation. After this step, the agent has everything needed to investigate autonomously.

## RULES

- This step is fully automatic — no user interaction
- Discover tools dynamically — never hardcode tool names, ports, or URLs
- All paths are relative or from workflow-context.md variables

## SEQUENCE

### 1. Load infrastructure knowledge

If `.claude/workflow-knowledge/environment-config.md` exists at project root, read it. Extract:
- Service URLs for `{TARGET_ENV}`
- Database connection info relevant to `{AFFECTED_SERVICE}`
- Health check endpoints

If `.claude/workflow-knowledge/infrastructure.md` exists at project root, read it. Extract:
- Cloud platform layout
- Deployment pipeline structure
- Database management rules

Store combined findings as `INFRA_CONTEXT`.

### 2. Discover local skills

Scan `.claude/skills/` at project root. For each skill directory, read its `SKILL.md` to understand:
- What it does (from description)
- When to use it (from trigger phrases)

Build an inventory of skills relevant to troubleshooting:

| Category | Look for skills matching | Purpose |
|----------|--------------------------|---------|
| **DB access** | "database", "db connect", "query", "psql", "Cloud SQL" | Connect to DB read-only |
| **Logs** | "logs", "logging", "Cloud Run", "gcloud" | Read service logs |
| **CI/CD** | "pipeline", "CI", "deploy", "GitLab" | Check recent deployments |
| **API access** | "API", "SFTP", "FTP", provider names | Access external data sources |
| **Auth** | "auth", "JWT", "magic link", "token" | Test authenticated endpoints |

Store the relevant skill list as `LOCAL_SKILLS`.

### 3. Identify affected service files

In the project root, search for the affected service:
- Look for directories matching the service name under `apps/`, `services/`, `src/`, or similar
- Identify the service's source directory, test directory, and configuration files
- Note the ORM (Prisma, Drizzle, TypeORM, etc.) and database schema location

Store as `SERVICE_FILES`.

### 4. Create investigation worktree

```bash
git fetch origin main
git worktree add ../{WORKTREE_PREFIX}-troubleshoot-{AFFECTED_SERVICE} origin/main -b troubleshoot/{AFFECTED_SERVICE}-{DATE}
```

Where `{DATE}` is today's date in `YYYY-MM-DD` format.

**If worktree creation fails:** HALT — report error.

Store `WORKTREE_PATH` = resolved worktree path.

Install dependencies in the worktree:
```bash
cd {WORKTREE_PATH} && {INSTALL_COMMAND}
```

Log: "Worktree created: {WORKTREE_PATH}"

### 5. Check recent deployments

If a CI/CD skill exists in `LOCAL_SKILLS`:
- Check the last deployment to `{TARGET_ENV}`
- Note the deploy timestamp, commit hash, and tag/branch
- Compare deploy timestamp to symptom start time

If no CI/CD skill, use forge CLI:
```bash
{FORGE_CLI} api "projects/{FORGE_PROJECT_PATH_ENCODED}/pipelines?per_page=5&order_by=id&sort=desc"
```

Store as `DEPLOY_CONTEXT` — was a deploy close to the symptom start time?

### 6. Auto-proceed

All context loaded. Proceed to investigation.

---

**Next:** Read fully and follow `./steps/step-03-investigate.md`
