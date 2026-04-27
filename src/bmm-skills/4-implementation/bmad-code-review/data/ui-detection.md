# UI Detection

**Consumed by:** Meta-6 activation (sub-axes 6a Accessibility, 6b Internationalization), sub-axis 4e (Performance — frontend perf-sensitive paths).

Meta-6 only runs if BOTH of these are true:

1. `CHANGED_FILES` contains at least one UI file
2. the tech-stack-lookup protocol with field `ui: web` (the project declares itself as having a web UI)

If only one condition is met, Meta-6 does not activate.

---

## UI globs

Match against `CHANGED_FILES`. A file is a UI file if its path matches ANY of the following globs:

### Component / template files

```
**/*.tsx
**/*.jsx
**/*.vue
**/*.svelte
**/*.astro
**/*.html
**/*.htm
**/*.hbs
**/*.ejs
**/*.pug
**/*.mdx
```

### Framework-specific directories

```
src/components/**
src/pages/**
src/views/**
src/screens/**
app/**/page.{tsx,jsx}       # Next.js App Router
app/**/layout.{tsx,jsx}     # Next.js App Router
pages/**/*.{tsx,jsx}        # Next.js Pages Router
src/routes/**/*.svelte      # SvelteKit
src/routes/**/*.tsx         # SolidStart
public/**
static/**
```

### Style files

```
**/*.css
**/*.scss
**/*.sass
**/*.less
**/*.styl
**/*.stylus
```

Style-only changes activate Meta-6 at reduced scope: 6a if the tech-stack-lookup protocol with field `a11y_covered: true`, 6b if the CSS touches text content (unlikely).

---

## Stack.md contract

Sub-axis 6a + 6b consume these fields from `{MAIN_PROJECT_ROOT}/.claude/workflow-knowledge/project.md`:

```yaml
ui: web | none                  # gates Meta-6 activation
a11y_covered: true | false      # whether EAA compliance is in scope (EU-targeted project)

i18n:
  library: i18next | formatjs | vue-i18n | angular-i18n | react-intl | none
  supported_locales: ['en', 'fr', 'es', 'ar']   # for plural/RTL logic
  rtl_required: true | false
```

Phase 6 extends the tech-stack schema (per `~/.claude/skills/bmad-shared/knowledge-schema.md`) to include these fields. Projects that have not yet updated their tech-stack section default to `ui: none` → Meta-6 does not activate.

---

## Component primitives to detect

Sub-axis 6a (a11y) grep patterns:

- `<img ` without `alt=` attribute → BLOCKER on EAA-covered project
- `<button ` without accessible text content (neither text nor `aria-label`) → BLOCKER
- `<a ` without href or with empty href → WARNING
- Interactive elements using `<div>` / `<span>` without `role=` → WARNING
- Custom focus management: grep for `tabindex="{-1,0,1}"` — flag non-zero positive as WARNING

Sub-axis 6b (i18n) grep patterns:

- Hardcoded user-facing strings in component literal: `<h1>Welcome`, `<button>Save</button>`, `toast.error('Failed to save')` → BLOCKER when `i18n.library ≠ none`
- Plural logic using `if (count === 1)` instead of CLDR plural rules → WARNING
- Physical CSS properties (`margin-left`, `padding-right`) instead of logical (`margin-inline-start`, `padding-inline-end`) in a project with `rtl_required: true` → WARNING
