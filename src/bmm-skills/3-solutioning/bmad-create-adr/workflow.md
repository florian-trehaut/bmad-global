# Create ADR — Workflow

**PLACEHOLDER — This workflow will be developed in a future iteration.**

**Goal:** Guide the creation of a well-structured Architecture Decision Record through evidence-based investigation. Can be invoked standalone or as a sub-workflow when spec/dev workflows detect the need for a new architectural decision.

---

## WHEN TO CREATE AN ADR

An ADR should be created when any of these conditions are met:

- **New service or module** — introducing a new bounded context, microservice, or standalone module
- **New integration pattern** — adding a new external API, message broker, event bus, or data pipeline
- **New data store** — introducing a new database, cache, or storage technology
- **Pattern deviation** — choosing a different approach from what existing code uses (e.g., switching from REST to gRPC for a specific service)
- **Technology choice** — adopting a new framework, library, or tool that sets a precedent
- **Architecture change** — modifying the system's topology, deployment model, or communication patterns
- **Security model change** — altering authentication, authorization, or data protection approaches
- **Migration strategy** — planning a migration from one technology/pattern to another

## PLANNED WORKFLOW STEPS

1. **Context capture** — What is the problem? What forces are at play? What constraints exist?
2. **Options discovery** — What alternatives exist? (include "do nothing" as baseline)
3. **Evidence gathering** — For each option: PoC results, benchmarks, team experience, ecosystem maturity
4. **Trade-off evaluation** — Structured comparison against decision drivers
5. **Decision formulation** — Clear statement of the chosen option with justification
6. **Consequences documentation** — Positive, negative, and risks of the chosen approach
7. **Publication** — Write the ADR to the project's ADR location and/or tracker

## SUB-WORKFLOW MODE

When triggered from another workflow (quick-spec, dev-story, spike), the calling workflow provides:
- The architectural decision that needs to be made
- The context from the current work (issue, spec, code changes)
- The project's ADR location and format

The ADR creation workflow produces the ADR and returns control to the calling workflow.

## PLACEHOLDER — NOT YET IMPLEMENTED

This workflow is a placeholder. When invoked, it should:

1. Inform the user: "The ADR creation workflow is not yet implemented. Here's what needs to happen:"
2. Present the decision that triggered the ADR need
3. Suggest the user create the ADR manually using the project's ADR format
4. Offer to help structure the content conversationally

---

## WORKFLOW COMPLETION — RETROSPECTIVE

After the final step completes (whether successfully or via early termination), read fully and follow `~/.claude/skills/bmad-shared/retrospective-step.md`.

**This step is CONDITIONAL** — it only activates if difficulties were encountered. If the workflow ran smoothly with no HALTs, corrections, or workarounds, it is silently skipped.
