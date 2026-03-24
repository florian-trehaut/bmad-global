# Step 05 — Detect Infrastructure

**Goal:** Auto-detect cloud provider, CI/CD, containers, IaC, database management, and deployment model.

---

## 1. Detect Cloud Provider

```bash
# GCP
which gcloud 2>/dev/null && echo "gcloud CLI found"
ls .gcloudignore 2>/dev/null && echo ".gcloudignore found"
ls app.yaml 2>/dev/null && echo "app.yaml found (App Engine)"
find . -maxdepth 3 -name "cloudrun-template.*" 2>/dev/null | head -5

# AWS
which aws 2>/dev/null && echo "aws CLI found"
ls -d .aws/ 2>/dev/null
ls serverless.yml sam-template.yaml 2>/dev/null
find . -maxdepth 3 -name "*.lambda.*" 2>/dev/null | head -5

# Azure
which az 2>/dev/null && echo "az CLI found"
ls azure-pipelines.yml 2>/dev/null

# Vercel
ls vercel.json .vercel/ 2>/dev/null
grep -l "vercel" package.json 2>/dev/null

# Fly.io
ls fly.toml 2>/dev/null

# Railway
ls railway.json 2>/dev/null

# Heroku
ls Procfile 2>/dev/null
```

Refer to `../data/detection-patterns.md` for the full pattern table.

## 2. Detect CI/CD

```bash
# GitLab CI
ls .gitlab-ci.yml 2>/dev/null && echo "GitLab CI found"
find . -maxdepth 2 -name "*.gitlab-ci.yml" -o -name "deploy*.yml" 2>/dev/null | head -10

# GitHub Actions
ls -d .github/workflows/ 2>/dev/null && echo "GitHub Actions found"
ls .github/workflows/*.yml 2>/dev/null

# Jenkins
ls Jenkinsfile 2>/dev/null && echo "Jenkins found"

# Bitbucket Pipelines
ls bitbucket-pipelines.yml 2>/dev/null && echo "Bitbucket Pipelines found"

# CircleCI
ls .circleci/config.yml 2>/dev/null && echo "CircleCI found"
```

If CI config found, scan for key patterns:
- Deployment stages/environments (dev, staging, production)
- Security scans (SAST, DAST, secret detection, dependency scan)
- Auto-deploy triggers

## 3. Detect Containers

```bash
# Docker
ls Dockerfile docker-compose.yml docker-compose.yaml compose.yml compose.yaml 2>/dev/null
find . -maxdepth 3 -name "Dockerfile" -not -path "*/node_modules/*" 2>/dev/null | head -10

# Makefile (often wraps Docker)
ls Makefile 2>/dev/null && echo "Makefile found"
```

If Makefile found, scan for common targets:
```bash
grep -E "^[a-zA-Z_-]+:" Makefile 2>/dev/null | head -20
```

## 4. Detect Infrastructure as Code

```bash
# Terraform
find . -maxdepth 3 -type d -name "terraform" 2>/dev/null | head -5
find . -maxdepth 4 -name "*.tf" -not -path "*/node_modules/*" 2>/dev/null | head -10

# Pulumi
ls Pulumi.yaml 2>/dev/null
find . -maxdepth 3 -type d -name "pulumi" 2>/dev/null

# CDK
ls cdk.json 2>/dev/null

# CloudFormation
find . -maxdepth 3 -name "*.cloudformation.*" -o -name "template.yaml" 2>/dev/null | head -5
```

## 5. Detect Database Setup

```bash
# Migration directories
find . -maxdepth 4 -type d -name "migrations" -not -path "*/node_modules/*" 2>/dev/null | head -10
find . -maxdepth 4 -type d -name "prisma" -not -path "*/node_modules/*" 2>/dev/null | head -10

# Docker Compose DB services
grep -A2 "postgres\|mysql\|mongo\|redis" docker-compose.yml 2>/dev/null | head -20

# .env files (for DB connection patterns, not values)
ls .env .env.example .env.local .env.development 2>/dev/null
grep -i "DATABASE_URL\|DB_HOST\|MONGO_URI\|REDIS_URL" .env.example 2>/dev/null
```

## 6. Ask User

Present findings and ask about deployment model:

1. **Environments**: Which environments exist? (dev, staging, production, QA, etc.)
2. **Deployment trigger**: How are deployments triggered? (auto on merge to main, manual, tag-based, etc.)
3. **Deployment pipeline**: Describe the flow (e.g., "MR → dev manual → main → staging auto → tag → prod auto")
4. **Domain structure**: What domain pattern do environments use? (e.g., `*.staging.example.com`, `*.example.com`)
5. **Cloud regions**: Which regions are services deployed to?
6. **Database management rules**: Any prohibitions? (e.g., never use db:push, never manual DDL)
7. **Env var policy**: Must crash on missing, or fallbacks allowed?

---

## CHECKPOINT

Present the detected infrastructure:

```
Cloud provider:    {GCP / AWS / Azure / Vercel / etc.}
CI/CD:             {GitLab CI / GitHub Actions / etc.}
IaC:               {Terraform / Pulumi / CDK / none}
Containers:        {Docker + Compose / none}
Deployment flow:   {description}
Environments:      {list}
Domain pattern:    {pattern}
Database:          {Postgres / MySQL / etc.} via {Prisma / Drizzle / etc.}
DB rules:          {e.g., migrations only, no db:push, no manual DDL}
Env var policy:    {crash on missing / fallbacks allowed}
```

Ask user: "Does this look correct? Any cloud resources or deployment details to add?"

**Store all confirmed values for step-06 and step-07 (infrastructure.md generation).**

---

**Next:** Read and follow `./steps/step-06-generate-context.md`
