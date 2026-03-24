# Step 1: Understand the Symptom

## STEP GOAL

Understand the bug by autonomously gathering evidence FIRST, then asking targeted questions only for what cannot be discovered programmatically.

## RULES

- **Investigate first, ask second** — logs, tracker, recent deploys, and code are all accessible. Use them before asking the user.
- Detect the user's language and match it
- If the user already described the symptom, acknowledge it and start investigating immediately
- Ask questions ONLY for information that cannot be found in logs, tracker, code, or infrastructure

## SEQUENCE

### 1. Load severity reference

Read `../data/severity-classification.md` before proceeding.

### 2. Acknowledge the symptom

Greet {USER_NAME} briefly. Acknowledge what they described. Do NOT re-ask what they already told you.

Announce that you are starting autonomous investigation.

### 3. Autonomous evidence gathering (PARALLEL)

Launch these investigations in parallel based on what the user described:

**a. Tracker search** — find related issues (recent, in-progress, recently closed):

```
{TRACKER_MCP_PREFIX}list_issues(team: '{TRACKER_TEAM}', query: '{keywords_from_symptom}', limit: 10, updatedAt: '-P7D')
```

**b. Recent deploys** — check CI/CD for recent deployments to the affected environment. Use the project's CI/CD skill if available.

**c. Logs** — check production/staging logs for the affected service. Use GCP observability tools if available, or the project's log access skills.

**d. Code search** — grep the codebase for the affected component to understand its current state, recent changes (`git log --oneline -20 -- <paths>`).

### 4. Targeted questions (ONLY for gaps)

After gathering evidence, identify what is still unknown. Ask ONLY what cannot be determined from the evidence collected.

Common questions that should be answered by investigation, NOT by asking the user:

| Question | How to find it yourself |
|----------|------------------------|
| What exactly happens? | Logs, error messages, tracker |
| Which environment? | User usually says; if not, check all envs |
| Which service? | User usually says; infer from context |
| When did it start? | Deploy history, log timestamps, error rate changes |
| Recent changes? | git log, CI/CD pipeline history, tracker |

Questions that MAY require user input (ask only if needed):

| Question | Purpose | Skip if |
|----------|---------|---------|
| Can you reproduce it? How? | Reproducibility steps | Logs show clear pattern |
| Who is affected? | Blast radius scoping | Logs/DB show the scope |
| Any manual action taken? | Context on interim fixes | Tracker/commits show it |

Ask remaining questions in ONE message. If no questions remain, skip to step 5.

### 5. Classify severity

Using the severity classification matrix and the evidence gathered, determine:

- **Severity**: SEV-1 to SEV-4
- **Blast radius**: all users / tenant-scoped / single user / edge case
- **Likely regression**: yes/no (based on timeline + recent deploys)

### 6. Summarize understanding

Present a structured summary with evidence references:

```
## Bug Summary

**Symptom:** {description}
**Environment:** {env}
**Service:** {service}
**Severity:** {SEV-N} — {justification}
**Blast radius:** {scope}
**Regression likely:** {yes/no}
**Reproducible:** {yes/no/unknown}
**Existing issue:** {ISSUE_PREFIX-NNN or "none found"}

### Evidence collected
- Logs: {what was found}
- Recent deploys: {last deploy date/commit}
- Tracker: {related issues found}
- Code: {recent changes to affected area}
```

"Est-ce que ce résumé est correct ? Quelque chose à corriger avant que je continue l'investigation approfondie ?"

WAIT for user confirmation. Apply corrections.

---

**Next:** Read fully and follow `./steps/step-02-map.md`
