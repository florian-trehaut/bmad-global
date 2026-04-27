#!/usr/bin/env python3
"""
Generate customize.toml + rewritten SKILL.md for Shape A workflow skills.

Shape A = skill directory containing `workflow.md` + `steps/` + a minimal
SKILL.md that delegates via `Follow the instructions in ./workflow.md.`

This script extends upstream BMAD-METHOD's TOML customization system to
fork-specific workflow skills that upstream didn't cover (TEA, ADR, validation,
etc.). It does NOT touch upstream-covered skills (already have customize.toml),
meta-tools, utility-batch, sub-skills, or developer-execution skills.

Usage:
  python3 src/scripts/generate_customization.py --skill <path> [--dry-run] [--force]
  python3 src/scripts/generate_customization.py --batch <batch-name> [--dry-run] [--force]

Flags:
  --dry-run   Print proposed changes without writing.
  --force     Overwrite even if target customize.toml or SKILL.md marker already present.

Idempotency:
  - customize.toml: skipped if already exists and content matches template (unless --force).
  - SKILL.md: skipped if already contains "Activation complete" marker (unless --force).

Requires Python 3.11+ (uses stdlib tomllib).
"""

import argparse
import re
import sys
from pathlib import Path

try:
    import tomllib
except ImportError:
    sys.stderr.write("error: Python 3.11+ is required (stdlib `tomllib` not found).\n")
    sys.exit(3)


# =============================================================================
# BATCH DEFINITIONS (per /Users/floriantrehaut/.claude/plans/resilient-coalescing-codd.md)
# =============================================================================

BATCHES = {
    "1-fix-create-story": [
        "src/bmm-skills/2-plan-workflows/bmad-create-story",
    ],
    "2-workflow-conversational": [
        "src/bmm-skills/3-solutioning/bmad-create-adr",
        "src/bmm-skills/3-solutioning/bmad-adr-review",
        "src/bmm-skills/3-solutioning/bmad-spike",
        "src/bmm-skills/3-solutioning/bmad-nfr-assess",
        "src/bmm-skills/4-implementation/bmad-troubleshoot",
        "src/bmm-skills/4-implementation/bmad-daily-planning",
        "src/core-skills/bmad-knowledge-bootstrap",
        "src/core-skills/bmad-knowledge-refresh",
        "src/core-skills/bmad-project-init",
        "src/core-skills/bmad-brainstorming",
    ],
    "3-tea": [
        "src/bmm-skills/4-implementation/bmad-tea-framework",
        "src/bmm-skills/4-implementation/bmad-tea-atdd",
        "src/bmm-skills/4-implementation/bmad-tea-automate",
        "src/bmm-skills/4-implementation/bmad-tea-ci",
        "src/bmm-skills/4-implementation/bmad-tea-test-review",
        "src/bmm-skills/4-implementation/bmad-tea-trace",
        "src/bmm-skills/4-implementation/bmad-qa-automate",
        "src/bmm-skills/4-implementation/bmad-test-design",
    ],
    "4-validation": [
        "src/bmm-skills/4-implementation/bmad-validation-desktop",
        "src/bmm-skills/4-implementation/bmad-validation-frontend",
        "src/bmm-skills/4-implementation/bmad-validation-metier",
    ],
}


# =============================================================================
# TEMPLATES
# =============================================================================

CUSTOMIZE_TOML_TEMPLATE = """# DO NOT EDIT -- overwritten on every update.
#
# Workflow customization surface for {skill_name}. Mirrors the
# agent customization shape under the [workflow] namespace.

[workflow]

# --- Configurable below. Overrides merge per BMad structural rules: ---
#   scalars: override wins \u2022 arrays (persistent_facts, activation_steps_*): append
#   arrays-of-tables with `code`/`id`: replace matching items, append new ones.

# Steps to run before the standard activation (config load, greet).
# Overrides append. Use for pre-flight loads, compliance checks, etc.

activation_steps_prepend = []

# Steps to run after greet but before the workflow begins.
# Overrides append. Use for context-heavy setup that should happen
# once the user has been acknowledged.

activation_steps_append = []

# Persistent facts the workflow keeps in mind for the whole run
# (standards, compliance constraints, stylistic guardrails).
# Distinct from the runtime memory sidecar -- these are static context
# loaded on activation. Overrides append.
#
# Each entry is either:
#   - a literal sentence, e.g. "All briefs must include a regulatory-risk section."
#   - a file reference prefixed with `file:`, e.g. "file:{{project-root}}/docs/standards.md"
#     (glob patterns are supported; the file's contents are loaded as facts).

persistent_facts = [
  "file:{{project-root}}/**/project-context.md",
]
"""


SKILL_MD_TEMPLATE = """---
name: {name}
description: {description_yaml}
disable-model-invocation: true
---

# {title}

<!-- TODO: review title above (auto-humanized from skill name) -->

## Overview

{overview}

<!-- TODO: review overview above (auto-derived from description) -->

## Conventions

- Bare paths (e.g. `steps/step-01-init.md`) resolve from the skill root.
- `{{skill-root}}` resolves to this skill's installed directory (where `customize.toml` lives).
- `{{project-root}}`-prefixed paths resolve from the project working directory.
- `{{skill-name}}` resolves to the skill directory's basename.

## On Activation

### Step 1: Resolve the Workflow Block

Run: `python3 {{project-root}}/_bmad/scripts/resolve_customization.py --skill {{skill-root}} --key workflow`

**If the script fails**, resolve the `workflow` block yourself by reading these three files in base \u2192 team \u2192 user order and applying the same structural merge rules as the resolver:

1. `{{skill-root}}/customize.toml` \u2014 defaults
2. `{{project-root}}/_bmad/custom/{{skill-name}}.toml` \u2014 team overrides
3. `{{project-root}}/_bmad/custom/{{skill-name}}.user.toml` \u2014 personal overrides

Any missing file is skipped. Scalars override, tables deep-merge, arrays of tables keyed by `code` or `id` replace matching entries and append new entries, and all other arrays append.

### Step 2: Execute Prepend Steps

Execute each entry in `{{workflow.activation_steps_prepend}}` in order before proceeding.

### Step 3: Load Persistent Facts

Treat every entry in `{{workflow.persistent_facts}}` as foundational context you carry for the rest of the workflow run. Entries prefixed `file:` are paths or globs under `{{project-root}}` \u2014 load the referenced contents as facts. All other entries are facts verbatim.

### Step 4: Load Project Workflow Context

Resolve the main project root (worktree-aware): run `MAIN_PROJECT_ROOT=$(dirname "$(git rev-parse --git-common-dir)")`.

Load `{{MAIN_PROJECT_ROOT}}/.claude/workflow-context.md` and resolve from its YAML frontmatter:
- Use `{{user_name}}` for greeting
- Use `{{communication_language}}` for all communications
- Use `{{document_output_language}}` for output documents
- Use `{{planning_artifacts}}` for output location and artifact scanning
- Use `{{project_knowledge}}` for additional context scanning

If `workflow-context.md` is missing, ask the user for their name and preferred language, then continue.

### Step 5: Greet the User

Greet `{{user_name}}`, speaking in `{{communication_language}}`. Be warm but efficient.

### Step 6: Execute Append Steps

Execute each entry in `{{workflow.activation_steps_append}}` in order.

---

**Activation complete.** Read fully and follow `./workflow.md` for the step-by-step workflow.
"""


# =============================================================================
# PARSING / GENERATION
# =============================================================================


def parse_frontmatter(skill_md_path: Path) -> dict:
    """Extract YAML frontmatter from SKILL.md as a dict."""
    content = skill_md_path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n", content, re.DOTALL)
    if not m:
        raise ValueError(f"No frontmatter found in {skill_md_path}")
    fm_text = m.group(1)
    # Simple key:value parse (skill frontmatter is trivial)
    fm = {}
    for line in fm_text.splitlines():
        if ":" in line and not line.startswith(" "):
            key, _, value = line.partition(":")
            fm[key.strip()] = value.strip()
    return fm


def humanize_skill_name(skill_name: str) -> str:
    """bmad-tea-framework -> TEA Framework (approximate)."""
    parts = skill_name.replace("bmad-", "").split("-")
    # Special-case known acronyms
    acronyms = {
        "tea",
        "qa",
        "ci",
        "adr",
        "ux",
        "api",
        "nfr",
        "prd",
        "atdd",
        "llm",
        "bdd",
        "tdd",
    }
    titled = []
    for p in parts:
        if p.lower() in acronyms:
            titled.append(p.upper())
        else:
            titled.append(p.capitalize())
    return " ".join(titled)


def quote_yaml_description(description: str) -> str:
    """Return a YAML-safe quoted description value."""
    description = description.strip()
    # Already quoted? Keep as-is.
    if (description.startswith('"') and description.endswith('"')) or (
        description.startswith("'") and description.endswith("'")
    ):
        return description
    # Needs quoting if contains colons, quotes, leading/trailing whitespace.
    escaped = description.replace('"', '\\"')
    return f'"{escaped}"'


def generate_skill_md(skill_dir: Path, force: bool) -> tuple[bool, str]:
    """Generate SKILL.md. Returns (changed, reason)."""
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        return False, "no SKILL.md"

    existing = skill_md.read_text()
    if "Activation complete" in existing and not force:
        return False, "already has activation marker"

    fm = parse_frontmatter(skill_md)
    name = fm.get("name", skill_dir.name)
    description = fm.get("description", "")

    title = humanize_skill_name(name)

    # Overview: strip leading/trailing quotes, take first sentence
    clean_desc = description.strip().strip('"').strip("'")
    sentences = re.split(r"(?<=[.!?])\s+", clean_desc)
    overview = sentences[0] if sentences else clean_desc

    rendered = SKILL_MD_TEMPLATE.format(
        name=name,
        description_yaml=quote_yaml_description(description),
        title=title,
        overview=overview,
    )
    return True, rendered


def generate_customize_toml(skill_dir: Path, force: bool) -> tuple[bool, str]:
    """Generate customize.toml. Returns (changed, content)."""
    toml_path = skill_dir / "customize.toml"
    if toml_path.exists() and not force:
        return False, "already exists"

    content = CUSTOMIZE_TOML_TEMPLATE.format(skill_name=skill_dir.name)
    return True, content


def validate_toml(content: str, skill_name: str) -> None:
    """Parse the generated TOML to catch syntax errors early."""
    try:
        tomllib.loads(content)
    except tomllib.TOMLDecodeError as e:
        raise SystemExit(f"TOML syntax error for {skill_name}: {e}")


# =============================================================================
# ENTRY POINT
# =============================================================================


def process_skill(skill_dir: Path, dry_run: bool, force: bool) -> dict:
    """Process a single skill. Returns status dict."""
    if not skill_dir.exists():
        return {
            "skill": skill_dir.name,
            "status": "SKIP",
            "reason": "directory missing",
        }

    result = {"skill": skill_dir.name, "dir": str(skill_dir), "changes": []}

    # 1. customize.toml
    changed_toml, toml_content = generate_customize_toml(skill_dir, force)
    if changed_toml:
        validate_toml(toml_content, skill_dir.name)
        if not dry_run:
            (skill_dir / "customize.toml").write_text(toml_content)
        result["changes"].append("customize.toml")
    else:
        result["changes"].append(f"customize.toml SKIP ({toml_content})")

    # 2. SKILL.md
    changed_md, md_content = generate_skill_md(skill_dir, force)
    if changed_md:
        if not dry_run:
            (skill_dir / "SKILL.md").write_text(md_content)
        result["changes"].append("SKILL.md")
    else:
        result["changes"].append(f"SKILL.md SKIP ({md_content})")

    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--skill", help="Path to a single skill directory")
    mode.add_argument("--batch", choices=BATCHES.keys(), help="Run a named batch")
    parser.add_argument("--dry-run", action="store_true", help="Do not write files")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files")
    args = parser.parse_args()

    # Resolve working directory to repo root (script lives in src/scripts)
    repo_root = Path(__file__).resolve().parent.parent.parent

    if args.skill:
        skill_dirs = [Path(args.skill)]
    else:
        skill_dirs = [repo_root / rel for rel in BATCHES[args.batch]]

    prefix = "[dry-run] " if args.dry_run else ""
    print(f"{prefix}Processing {len(skill_dirs)} skill(s)...")
    print()

    for sd in skill_dirs:
        result = process_skill(sd, args.dry_run, args.force)
        changes = ", ".join(result["changes"])
        print(f"  {sd.relative_to(repo_root) if sd.is_absolute() else sd}: {changes}")

    print()
    print(f"{prefix}Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
