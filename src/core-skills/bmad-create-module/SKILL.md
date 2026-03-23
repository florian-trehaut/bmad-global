---
name: bmad-create-module
description: Builds BMAD modules through conversational discovery and validates existing ones. Use when the user requests to "create a module", "build a module", "validate a module", or "optimize module".
---

# Module Builder

## Overview

This skill helps you build BMAD modules through conversational discovery and iterative refinement. Act as an architect guide, walking users through six phases: intent discovery, module type classification, requirements gathering, drafting, building, and summary. Your output is a complete module structure — directory layout, module.yaml configuration, agent placeholders, workflow placeholders, and documentation — ready to install into any BMAD project.

Modules are **packages of agents, workflows, and configuration** that extend the BMAD framework for a specific domain. They bundle everything a user needs: AI personas with specialized expertise, structured processes for complex tasks, and customizable configuration collected during installation. Modules are the heart of the BMAD ecosystem — shareable, installable packages for any domain.

**Args:** Accepts `--headless` / `-H` for non-interactive execution, an initial description or brief path for create, or a path to an existing module with keywords like optimize or validate.

## On Activation

1. Detect user's intent. If `--headless` or `-H` is passed, or intent is clearly non-interactive, set `{headless_mode}=true` for all sub-prompts.

2. Load available config from `{project-root}/_bmad/config.yaml` and `{project-root}/_bmad/config.user.yaml` (root and bmb section). If missing, try legacy fallback at `{project-root}/_bmad/bmm/config.yaml` or `{project-root}/_bmad/bmb/config.yaml`. If still missing, and the `bmad-builder-setup` skill is available, let the user know they can run it at any time to configure. Resolve and apply throughout the session (defaults in parens):
   - `{user_name}` (default: null) — address the user by name
   - `{communication_language}` (default: user or system intent) — use for all communications
   - `{document_output_language}` (default: user or system intent) — use for generated document content
   - `{bmad_builder_output_folder}` (default: `{project-root}/_bmad-output/bmb-creations`) — save built modules here
   - `{bmad_builder_reports}` (default: `{project-root}/_bmad-output/bmb-creations/reports`) — save reports (quality, eval, planning) here

3. Route by intent.

## Build Process

This is the core creative path — where module ideas become reality. Through six phases of conversational discovery, you guide users from a rough vision to a complete module structure. This covers building new modules from scratch, editing existing modules, and converting non-compliant structures.

Modules are packages of agents, workflows, and configuration for a specific domain. The build process includes a lint gate for structural validation. Generated agent and workflow files are placeholders — use `bmad-agent-builder` and `bmad-workflow-builder` to flesh them out.

Load `build-process.md` to begin.

## Quality Optimizer

For modules that already exist but need validation or improvement. This is comprehensive structural and configuration analysis — directory compliance, module.yaml quality, agent completeness, workflow completeness, documentation quality, and module cohesion. Uses a deterministic lint script for instant structural checks and LLM scanner subagents for judgment-based analysis, all run in parallel.

Run this anytime you want to assess and improve an existing module's quality.

Load `quality-optimizer.md` — it orchestrates everything including scan modes, headless handling, and remediation options.

---

## Quick Reference

| Intent | Trigger Phrases | Route |
|--------|----------------|-------|
| **Builder** | "build/create/design a module", "new module", "edit module" | Load `build-process.md` |
| **Quality Optimizer** | "validate module", "check module", "optimize module", "review module" | Load `quality-optimizer.md` |
| **Unclear** | — | Present the two options above and ask |

Regardless of what path is taken, respect and follow headless mode guidance if user requested headless_mode — if a specific instruction does not indicate how to handle headless mode, you will try to find a way.
