# Step 02: Execute Documentation Mode

## STEP GOAL

Execute the chosen documentation mode by scanning the codebase and producing one or more structured documentation documents. The output varies by mode — initial scan produces a single overview, full rescan produces multiple per-service documents, deep dive produces detailed analysis of the target area.

## RULES

- Read actual source files — never describe behavior from directory names alone
- Each produced document must be self-contained and coherent
- Track all produced documents in `{DOCS_CREATED}` with title and content
- Adapt depth to mode: overview for initial scan, detailed for deep dive

## SEQUENCE

### 1. Execute based on mode

Follow the subsection matching `{MODE}`:

---

**MODE: initial_scan**

Scan the entire codebase and produce ONE overview document:

A. **Project Overview** — purpose, business domain, deployment model
B. **Architecture Map** — services/apps, their roles, how they communicate
C. **Data Layer** — databases, schemas, ORMs, migration strategy per service
D. **Shared Infrastructure** — packages, libs, cross-cutting concerns
E. **External Integrations** — third-party APIs, messaging, storage
F. **Development Workflow** — build, test, deploy, environments
G. **Key Patterns** — architecture style, error handling, config management

Add to `{DOCS_CREATED}`: title = `"Project Documentation — Overview"`, content = compiled document.

---

**MODE: full_rescan**

Scan the entire codebase and produce MULTIPLE documents:

**Document 1: Architecture Overview**
- System architecture, service map, communication patterns
- Data flow diagrams (described in text)
- Infrastructure and deployment model

**Document 2+: Per-service documentation** (one per significant service/app)
For each service, document:
- Purpose and business domain
- API surface (endpoints, events published/consumed)
- Data model (key entities, relationships)
- Dependencies (internal packages, external services)
- Configuration and environment requirements
- Notable patterns or deviations from project standards

**Additional documents as needed:**
- Shared packages and libraries (if substantial)
- Cross-service workflows (if complex data flows exist)

Add each document to `{DOCS_CREATED}` with appropriate titles:
- `"Documentation: Architecture Overview"`
- `"Documentation: Service — {service_name}"` (one per service)
- `"Documentation: Shared Packages"` (if applicable)
- `"Documentation: Cross-Service Workflows"` (if applicable)

---

**MODE: deep_dive**

Focus exclusively on `{DEEP_DIVE_TARGET}` and produce ONE detailed document:

A. **Overview** — what it is, its role in the system, why it exists
B. **Architecture** — internal structure, layers, key abstractions
C. **Data Model** — entities, relationships, schema details, migrations
D. **API Surface** — endpoints/events with request/response shapes
E. **Business Logic** — core use cases, domain rules, edge cases
F. **Integration Points** — what it depends on, what depends on it
G. **Configuration** — environment variables, feature flags, settings
H. **Test Coverage** — existing tests, testing patterns, gaps
I. **Known Issues / Tech Debt** — TODOs, workarounds, deprecations

Add to `{DOCS_CREATED}`: title = `"Documentation: Deep Dive — {DEEP_DIVE_TARGET}"`, content = compiled document.

---

### 2. CHECKPOINT

Present a summary of documents produced:

```
Documentation produced: {N} document(s)

{For each document:}
- {title} — {N} sections, ~{N} lines
```

Ask if the user wants to adjust any document content before saving to the tracker.

WAIT for user confirmation.

---

**Next:** Read fully and follow `./step-03-save.md`
