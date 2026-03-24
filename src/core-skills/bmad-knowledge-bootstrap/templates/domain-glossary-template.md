# Domain Glossary — Knowledge

<!-- Template for bmad-knowledge-bootstrap. Domain entities, bounded contexts, ubiquitous language. NEW knowledge file. -->

## Ubiquitous Language

<!-- Key domain terms used in code and conversations. Table: Term | Definition | Code Representation. Detected from entity/model names, README, docs, variable naming patterns. -->

| Term | Definition | Code Representation |
|---|---|---|
| {e.g., Provider} | {business definition} | {e.g., Provider entity, ProviderService} |

## Bounded Contexts

<!-- Major domain areas / modules / services. For each: name, responsibility, key entities, boundaries. -->

### Context: {Name}

**Responsibility:** {what this context owns}

**Key Entities:**

- {Entity 1} — {role}
- {Entity 2} — {role}

**Boundaries:** {what this context does NOT handle — delegated to other contexts}

## Entity Relationships

<!-- Key relationships between domain entities. Can be a list or a description — not necessarily a full ERD. -->

## Domain Rules

<!-- Critical business rules that code must enforce. Detected from validation logic, guard clauses, domain exceptions. -->

## External Systems

<!-- External services, APIs, or data sources the domain interacts with. Table: System | Purpose | Integration Point. -->

| System | Purpose | Integration Point |
|---|---|---|
| {e.g., Stripe} | {payments} | {e.g., PaymentAdapter} |
