---
type: 'subagent-workflow'
parent_workflow: 'bmad-code-review'
meta: 6
meta_weight: 0.05
conditional: true
---

# Meta-6 Subagent Workflow: User-Facing Quality

**Goal:** Verify the UI meets accessibility and internationalization standards.

**Sub-axes (2):**

| Sub-axis | Name | Always-on (when M6 activates) |
|----------|------|-----------|
| 6a | Accessibility (WCAG 2.2 AA) | ✓ |
| 6b | Internationalization | ✓ (conditional on `stack.md: i18n.library ≠ none`) |

**Meta-6 itself is conditional.** Activated by step-01 when UI globs match (`*.tsx`, `*.vue`, `*.svelte`, `*.html`, `*.astro`, `src/components/**`) AND `stack.md: ui: web`. If M6 does not activate, its 0.05 weight renormalizes across active metas.

---

## ANTI-DEVIATION CONTRACT

Same as other metas. READ-ONLY, never downgrade BLOCKER.

---

## SUB-AXIS 6a: Accessibility (WCAG 2.2 AA)

**Condition:** Always-on when Meta-6 runs. Phase 3 stub; populated in Phase 6.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta6-6a-stub'
    severity: QUESTION
    action: defer
    meta: 6
    sub_axis: '6a'
    title: 'Accessibility sub-axis not yet populated (Phase 6)'
    detail: 'WCAG 2.2 AA (EAA BLOCKER-level since 2025-06-28, fines up to €3M), axe-core + eslint-plugin-jsx-a11y, ARIA 1.3 ("no ARIA > bad ARIA"), target size 24x24 (new 2.2 rule), focus visible, EAA + EN 301 549 + Section 508 mapping land in Phase 6.'
    not_implemented: true
```

### Phase 6 target scope

- **EAA (European Accessibility Act)** — enforceable since 2025-06-28, fines up to €3M → violations are BLOCKER-level on EAA-covered projects
- WCAG 2.2 AA conformance (new 2.2 rules: target size 24×24, focus appearance, dragging movements, consistent help, redundant entry, accessible authentication)
- Tooling: `axe-core` CI run + `eslint-plugin-jsx-a11y`
- ARIA 1.3: "no ARIA > bad ARIA" principle — prefer native HTML semantics
- Focus visible: `:focus-visible` required for keyboard navigation
- Section 508 mapping (US) + EN 301 549 (EU)

`<img>` without `alt` → **BLOCKER** on EAA-covered project. Non-keyboard-accessible component → **BLOCKER**.

---

## SUB-AXIS 6b: Internationalization

**Condition:** Always-on when Meta-6 runs AND `stack.md: i18n.library ≠ none`. Phase 3 stub; populated in Phase 6.

### Phase 3 stub

```yaml
findings:
  - id: 'F-meta6-6b-stub'
    severity: QUESTION
    action: defer
    meta: 6
    sub_axis: '6b'
    title: 'Internationalization sub-axis not yet populated (Phase 6)'
    detail: 'i18next / FormatJS / vue-i18n / angular-i18n, CLDR plurals (not `if count===1`), Intl.* + Temporal API (ES2026 Stage 4), RTL logical properties (margin-inline-start, not margin-left) land in Phase 6.'
    not_implemented: true
```

### Phase 6 target scope

- Library detection: `i18next`, `FormatJS`, `vue-i18n`, `angular-i18n`
- CLDR plurals: reject `if (count === 1) "item" else "items"` — use proper plural rules (`one`, `few`, `many`, `other`)
- `Intl.*` API (DateTimeFormat, NumberFormat, RelativeTimeFormat) + Temporal API (ES2026 Stage 4)
- RTL support: logical properties (`margin-inline-start`, `padding-block-end`) instead of physical (`margin-left`, `padding-bottom`)
- Hardcoded user-facing strings in UI source files → **BLOCKER** when `i18n.library ≠ none`
- Tooling: `i18next-parser`, grep for hardcoded strings

### Acceptable fallback exception

`data/acceptable-fallback-rules.md` (Phase 4) documents the i18n exception: translation-key fallback `t('key', { defaultValue: 'English' })` is allowed — zero-fallback applies to business-critical data only, not UI copy.

---

## OUTPUT FORMAT

Same schema as other metas. Meta-6 only present in `META_REPORTS` if step-01 activated it.

DO NOT compute verdict — judge-triage consolidates.
