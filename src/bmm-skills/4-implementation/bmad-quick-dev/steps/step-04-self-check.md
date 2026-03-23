# Step 4: Self-Check

**Goal:** Audit completed work against tasks, tests, AC, and patterns before adversarial review.

---

## SELF-CHECK AUDIT

### 1. Tasks Complete

- [ ] All tasks from tech-spec or plan marked complete
- [ ] No tasks skipped without documented reason
- [ ] Any blocked tasks have clear explanation

### 2. Tests Passing

- [ ] All existing tests still pass
- [ ] New tests written for new functionality
- [ ] No test warnings or skipped tests without reason

### 3. Acceptance Criteria Satisfied

For each AC:
- [ ] AC is demonstrably met
- [ ] Can explain how implementation satisfies AC
- [ ] Edge cases considered

### 4. Patterns Followed

- [ ] Follows existing code patterns in codebase
- [ ] Follows project rules from workflow-knowledge (if exists)
- [ ] Error handling consistent with codebase
- [ ] No forbidden patterns introduced

---

## UPDATE TECH-SPEC (Mode A only)

If `{execution_mode}` is "tech-spec":
1. Load `{tech_spec_path}`
2. Mark all tasks as complete
3. Update status to "Implementation Complete"
4. Save changes

---

## IMPLEMENTATION SUMMARY

Present summary:

```
**Implementation Complete!**

**Summary:** {what was implemented}
**Files Modified:** {list of files}
**Tests:** {test summary — passed/added/etc}
**AC Status:** {all satisfied / issues noted}

Proceeding to adversarial code review...
```

---

## NEXT STEP

Proceed immediately to `step-05-adversarial-review.md`.

---

**Next:** `./step-05-adversarial-review.md`
