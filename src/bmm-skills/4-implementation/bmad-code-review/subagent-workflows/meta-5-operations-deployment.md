---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
meta: 5
meta_weight: 0.10
conditional: true
---

# Meta-5 Subagent Workflow: Operations & Deployment

**Goal:** Verify the code is deployable, observable, and the commit history is clean.

**Sub-axes (3):**

| Sub-axis | Name | Always-on |
|----------|------|-----------|
| 5a | Infra Deployability | ✓ (when M5 activates) |
| 5b | Observability | conditional (new endpoints / jobs / alerts) |
| 5c | Commit History | ✓ (colleague review always) |

**Meta-5 itself is conditional.** Activated by step-01 when the diff contains: Dockerfile, `*.tf`, `k8s/**`, `.github/workflows/**`, new endpoints / jobs / alerts. If M5 does not activate, its 0.10 weight renormalizes across active metas.

---

## ANTI-DEVIATION CONTRACT

Same as other metas. READ-ONLY, never downgrade BLOCKER.

---

## SUB-AXIS 5a: Infra Deployability

**Condition:** Always-on when Meta-5 runs.

A MR that passes all tests but introduces undeployable services is a **BLOCKER**.

### Identify impacted services

```bash
cd {worktree_path}
git diff --name-only origin/{mr_target_branch}...HEAD | grep -oE '^(apps|libs|packages)/[^/]+' | sort -u
```

### For each impacted service

1. **Build pipeline** exists (Dockerfile + CI build step)
2. **Database migrations** generated for schema changes
3. **Deployment config** exists and is wired
4. **Infrastructure** — new cloud resources in Terraform
5. **Coherence** — cross-layer consistency (Terraform ↔ CI ↔ code)
6. **Dependency removal** — no stale references in Dockerfiles, CI scripts
7. **Migrations** — nullable columns without population plan → WARNING
8. **Environment config** — new env vars/secrets in code but not in deployment config → **BLOCKER**

### Phase 5 extensions (target)

- Kubernetes Pod Security Standards: restricted profile required (not baseline or privileged)
- SHA-pinning GitHub Actions (GH policy mandatory 2025-08) — unpinned = **BLOCKER**
- OIDC federation for cloud credentials (no long-lived secrets)
- Expand/contract non-reversible DB migrations (shared with 2c)
- Docker image `latest` tag in manifest → **BLOCKER**
- ArgoCD / Flux: `targetRevision` must be a pinned ref (not `main`, not `HEAD`)

---

## SUB-AXIS 5b: Observability

**Condition:** Conditional — activates when diff introduces new endpoints, background jobs, or alert rules. Phase 3 stub; populated in Phase 5.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta5-5b-stub'
    severity: QUESTION
    action: defer
    meta: 5
    sub_axis: '5b'
    title: 'Observability sub-axis not yet populated (Phase 5)'
    detail: 'OpenTelemetry semantic conventions, W3C trace context propagation, structured JSON logs with trace_id, multi-window multi-burn-rate SLO alerts, PII scrubbing at collector level land in Phase 5.'
    not_implemented: true
```

### Phase 5 target scope

- OpenTelemetry semantic conventions on spans / metrics / logs
- W3C trace context propagation across service boundaries
- Structured logs: JSON, always includes `trace_id` and `span_id`
- Multi-window multi-burn-rate SLO alerts (Google SRE workbook pattern)
- PII scrubbing at the collector level (not just at write-time)

New endpoint without metric / log / span = WARNING.

---

## SUB-AXIS 5c: Commit History

**Condition:** Always-on for colleague review, optional for self-review.

```bash
cd {worktree_path}
git log --oneline origin/{mr_target_branch}..HEAD
```

- [ ] Conventional commits format: `type(scope): description`
- [ ] No garbage commits: "fix", "wip", "typo", "test" → **BLOCKER**
- [ ] Self-contained commits (each is a logical unit)
- [ ] Single commit touching > 3 distinct domains → WARNING
- [ ] MR mixing unrelated features → WARNING

---

## OUTPUT FORMAT

Same schema as other metas. Meta-5 only present in `META_REPORTS` if step-01 activated it.

DO NOT compute verdict — judge-triage consolidates.
