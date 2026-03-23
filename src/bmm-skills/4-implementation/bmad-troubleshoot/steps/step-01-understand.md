# Step 1: Understand the Symptom

## STEP GOAL

Understand the bug through targeted questions, classify severity and blast radius. This is the only interactive step before the agent goes autonomous.

## RULES

- Ask targeted questions — not generic "what's wrong?"
- Detect the user's language and match it
- Do NOT start investigating yet — this step is purely about understanding
- If the user gives enough info upfront, skip redundant questions

## SEQUENCE

### 1. Load severity reference

Read `../data/severity-classification.md` before proceeding.

### 2. Greet and ask

Greet {USER_NAME} and ask what is broken. Adapt tone to {COMMUNICATION_LANGUAGE}.

If the user already described the symptom in their initial message, acknowledge it and move to targeted questions. Do NOT re-ask what they already told you.

### 3. Targeted questions

Ask ONLY what is missing from the user's description. Skip questions already answered.

| Question | Purpose | Skip if |
|----------|---------|---------|
| What exactly happens? (error message, wrong behavior, missing data) | Symptom precision | User already described it |
| Which environment? (dev, staging, production) | Target env | Already mentioned |
| Which service or feature? | Affected service | Already mentioned |
| When did it start? (after a deploy, always been there, intermittent) | Timeline | Already mentioned |
| Can you reproduce it? How? | Reproducibility | Already described steps |
| Who is affected? (all users, one client, one user) | Blast radius | Already scoped |

Ask the missing questions in ONE message, not one by one.

WAIT for user response.

### 4. Classify severity

Using the severity classification matrix, determine:

- **Severity**: SEV-1 to SEV-4
- **Blast radius**: all users / tenant-scoped / single user / edge case
- **Likely regression**: yes/no (based on timeline + recent deploys)

### 5. Check for existing tracker issue

Search the tracker for related issues:

```
{TRACKER_MCP_PREFIX}list_issues(team: '{TRACKER_TEAM}', query: '{keywords_from_symptom}', limit: 5, state: 'started')
```

If a matching issue exists, note it as `EXISTING_ISSUE_ID` — we may link to it later.

### 6. Summarize understanding

Present a structured summary:

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
```

"Is this accurate? Anything to correct before I start investigating?"

WAIT for user confirmation. Apply corrections.

---

**Next:** Read fully and follow `./steps/step-02-map.md`
