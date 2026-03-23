#!/usr/bin/env python3
"""Deterministic structure scanner for BMAD modules.

Validates a module directory against BMAD conventions:
1. module.yaml exists and parses correctly
2. Required files present (README.md)
3. Agent files follow naming conventions
4. Workflow directories have entry points
5. No absolute paths in any .md or .yaml files
6. Module code is valid kebab-case
"""

# /// script
# requires-python = ">=3.9"
# dependencies = ["pyyaml"]
# ///

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None  # type: ignore[assignment]


# Patterns
KEBAB_CASE_RE = re.compile(r'^[a-z][a-z0-9]*(-[a-z0-9]+)*$')
AGENT_FILE_RE = re.compile(r'^[a-z][a-z0-9-]*\.(agent\.(yaml|md)|agent\.spec\.md)$')
ABSOLUTE_PATH_RE = re.compile(
    r'(?:^|[\s"`\'(])(/(?:Users|home|opt|var|tmp|etc|usr)/\S+)', re.MULTILINE
)
HOME_PATH_RE = re.compile(r'(?:^|[\s"`\'(])(~/\S+)', re.MULTILINE)


def check_module_yaml(module_path: Path) -> list[dict]:
    """Validate module.yaml existence and content."""
    findings: list[dict] = []
    yaml_path = module_path / 'module.yaml'

    if not yaml_path.exists():
        findings.append({
            'file': 'module.yaml',
            'line': None,
            'severity': 'critical',
            'category': 'required-file',
            'title': 'module.yaml is missing',
            'detail': 'Every BMAD module must have a module.yaml file at its root',
            'action': 'Create module.yaml with required fields: code, name, header, subheader, default_selected',
        })
        return findings

    content = yaml_path.read_text(encoding='utf-8')

    if yaml is None:
        findings.append({
            'file': 'module.yaml',
            'line': None,
            'severity': 'medium',
            'category': 'parse',
            'title': 'PyYAML not available — skipping YAML validation',
            'detail': 'Install pyyaml to enable full module.yaml validation',
            'action': 'Run: pip install pyyaml',
        })
        return findings

    try:
        data = yaml.safe_load(content)
    except yaml.YAMLError as e:
        findings.append({
            'file': 'module.yaml',
            'line': None,
            'severity': 'critical',
            'category': 'parse',
            'title': f'module.yaml failed to parse: {e}',
            'detail': 'The YAML file has syntax errors and cannot be loaded',
            'action': 'Fix YAML syntax errors in module.yaml',
        })
        return findings

    if not isinstance(data, dict):
        findings.append({
            'file': 'module.yaml',
            'line': None,
            'severity': 'critical',
            'category': 'parse',
            'title': 'module.yaml root is not a mapping',
            'detail': f'Expected a YAML mapping (dict), got {type(data).__name__}',
            'action': 'Ensure module.yaml contains key-value pairs at the root level',
        })
        return findings

    # Required fields
    required_fields = ['code', 'name', 'header', 'subheader', 'default_selected']
    for field in required_fields:
        if field not in data:
            findings.append({
                'file': 'module.yaml',
                'line': None,
                'severity': 'critical' if field == 'code' else 'high',
                'category': 'required-field',
                'title': f'Missing required field: {field}',
                'detail': f'module.yaml must include the {field} field',
                'action': f'Add {field} to module.yaml',
            })

    # Validate code format
    code = data.get('code', '')
    if code:
        if not isinstance(code, str):
            findings.append({
                'file': 'module.yaml',
                'line': None,
                'severity': 'critical',
                'category': 'format',
                'title': f'Module code must be a string, got {type(code).__name__}',
                'detail': '',
                'action': 'Change code to a kebab-case string value',
            })
        elif not KEBAB_CASE_RE.match(code):
            findings.append({
                'file': 'module.yaml',
                'line': None,
                'severity': 'high',
                'category': 'format',
                'title': f'Module code "{code}" is not valid kebab-case',
                'detail': 'Module codes must be lowercase letters, numbers, and hyphens (kebab-case)',
                'action': f'Change code to a valid kebab-case identifier',
            })
        elif len(code) < 2 or len(code) > 20:
            findings.append({
                'file': 'module.yaml',
                'line': None,
                'severity': 'medium',
                'category': 'format',
                'title': f'Module code "{code}" length ({len(code)}) outside recommended range 2-20',
                'detail': 'Module codes should be between 2 and 20 characters',
                'action': 'Adjust module code length',
            })

    # Validate default_selected type
    if 'default_selected' in data:
        ds = data['default_selected']
        if not isinstance(ds, bool):
            findings.append({
                'file': 'module.yaml',
                'line': None,
                'severity': 'medium',
                'category': 'format',
                'title': f'default_selected should be boolean, got {type(ds).__name__}',
                'detail': 'Use true or false (YAML boolean), not a string',
                'action': 'Change default_selected to true or false',
            })

    return findings


def check_required_files(module_path: Path) -> list[dict]:
    """Check for required module files."""
    findings: list[dict] = []

    readme = module_path / 'README.md'
    if not readme.exists():
        findings.append({
            'file': 'README.md',
            'line': None,
            'severity': 'high',
            'category': 'required-file',
            'title': 'README.md is missing',
            'detail': 'Every BMAD module should have a README.md documenting its purpose and components',
            'action': 'Create README.md with module overview, components, and configuration sections',
        })

    return findings


def check_agent_files(module_path: Path) -> list[dict]:
    """Validate agent file naming conventions."""
    findings: list[dict] = []
    agents_dir = module_path / 'agents'

    if not agents_dir.exists():
        return findings

    for f in sorted(agents_dir.iterdir()):
        if f.is_file() and not f.name.startswith('.'):
            if not AGENT_FILE_RE.match(f.name):
                findings.append({
                    'file': f'agents/{f.name}',
                    'line': None,
                    'severity': 'high',
                    'category': 'naming',
                    'title': f'Agent file "{f.name}" does not follow naming convention',
                    'detail': 'Agent files must match: {role-name}.agent.yaml, {role-name}.agent.md, or {role-name}.agent.spec.md',
                    'action': f'Rename to follow the pattern {{role-name}}.agent.yaml or .agent.md',
                })

    return findings


def check_workflow_dirs(module_path: Path) -> list[dict]:
    """Validate workflow directories have entry points."""
    findings: list[dict] = []
    workflows_dir = module_path / 'workflows'

    if not workflows_dir.exists():
        return findings

    for d in sorted(workflows_dir.iterdir()):
        if d.is_dir() and not d.name.startswith('.'):
            # Check naming
            if not KEBAB_CASE_RE.match(d.name):
                findings.append({
                    'file': f'workflows/{d.name}/',
                    'line': None,
                    'severity': 'medium',
                    'category': 'naming',
                    'title': f'Workflow folder "{d.name}" is not kebab-case',
                    'detail': 'Workflow folder names should use kebab-case',
                    'action': f'Rename workflow folder to kebab-case',
                })

            # Check for entry point
            has_entry = False
            entry_patterns = [
                d / 'workflow.md',
                d / f'{d.name}.spec.md',
            ]
            for ep in entry_patterns:
                if ep.exists():
                    has_entry = True
                    break

            # Also check for any .spec.md as fallback
            if not has_entry:
                spec_files = list(d.glob('*.spec.md'))
                if spec_files:
                    has_entry = True

            if not has_entry:
                # Check if directory is completely empty
                contents = list(d.iterdir())
                if not contents:
                    findings.append({
                        'file': f'workflows/{d.name}/',
                        'line': None,
                        'severity': 'high',
                        'category': 'structure',
                        'title': f'Workflow folder "{d.name}" is empty',
                        'detail': 'Workflow folders must contain at least a workflow.md or *.spec.md entry point',
                        'action': f'Add workflow.md or {d.name}.spec.md to the folder',
                    })
                else:
                    findings.append({
                        'file': f'workflows/{d.name}/',
                        'line': None,
                        'severity': 'medium',
                        'category': 'structure',
                        'title': f'Workflow folder "{d.name}" has no standard entry point',
                        'detail': 'Expected workflow.md or {name}.spec.md as entry point',
                        'action': f'Add workflow.md or {d.name}.spec.md as the entry point',
                    })

    return findings


def check_absolute_paths(module_path: Path) -> list[dict]:
    """Scan .md and .yaml files for absolute paths."""
    findings: list[dict] = []

    for pattern in ('**/*.md', '**/*.yaml'):
        for f in sorted(module_path.glob(pattern)):
            content = f.read_text(encoding='utf-8')
            rel = f.relative_to(module_path)

            for regex, category, message in [
                (ABSOLUTE_PATH_RE, 'absolute-path', 'Absolute path found — not portable'),
                (HOME_PATH_RE, 'absolute-path', 'Home directory path (~/) found — not portable'),
            ]:
                for match in regex.finditer(content):
                    line_num = content[:match.start()].count('\n') + 1
                    line_content = content.split('\n')[line_num - 1].strip()
                    findings.append({
                        'file': str(rel),
                        'line': line_num,
                        'severity': 'high',
                        'category': category,
                        'title': message,
                        'detail': line_content[:120],
                        'action': 'Replace with {project-root} or config variable reference',
                    })

    return findings


def scan_module(module_path: Path) -> dict:
    """Run all checks on a module directory."""
    all_findings: list[dict] = []

    all_findings.extend(check_module_yaml(module_path))
    all_findings.extend(check_required_files(module_path))
    all_findings.extend(check_agent_files(module_path))
    all_findings.extend(check_workflow_dirs(module_path))
    all_findings.extend(check_absolute_paths(module_path))

    # Build summary
    by_severity: dict[str, int] = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
    by_category: dict[str, int] = {}

    for f in all_findings:
        sev = f['severity']
        if sev in by_severity:
            by_severity[sev] += 1
        cat = f['category']
        by_category[cat] = by_category.get(cat, 0) + 1

    # Inventory
    agents_dir = module_path / 'agents'
    workflows_dir = module_path / 'workflows'
    agent_files = sorted([f.name for f in agents_dir.iterdir() if f.is_file()]) if agents_dir.exists() else []
    workflow_dirs = sorted([d.name for d in workflows_dir.iterdir() if d.is_dir()]) if workflows_dir.exists() else []

    return {
        'scanner': 'module-structure',
        'script': 'scan-module-structure.py',
        'version': '1.0.0',
        'skill_path': str(module_path),
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'status': 'pass' if not all_findings else 'fail',
        'findings': all_findings,
        'assessments': {
            'has_module_yaml': (module_path / 'module.yaml').exists(),
            'has_readme': (module_path / 'README.md').exists(),
            'has_todo': (module_path / 'TODO.md').exists(),
            'has_help_csv': (module_path / 'module-help.csv').exists(),
            'agent_files': agent_files,
            'workflow_dirs': workflow_dirs,
            'top_level_items': sorted([
                p.name for p in module_path.iterdir() if not p.name.startswith('.')
            ]),
        },
        'summary': {
            'total_findings': len(all_findings),
            'by_severity': by_severity,
            'by_category': by_category,
            'assessment': (
                'Module structure scan complete — '
                + (f'{by_severity["critical"]} critical, {by_severity["high"]} high issues found'
                   if by_severity['critical'] or by_severity['high']
                   else 'no critical or high issues')
            ),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description='Scan BMAD module for structural compliance',
    )
    parser.add_argument(
        'module_path',
        type=Path,
        help='Path to the module directory to scan',
    )
    parser.add_argument(
        '--output', '-o',
        type=Path,
        help='Write JSON output to file instead of stdout',
    )
    args = parser.parse_args()

    if not args.module_path.is_dir():
        print(f'Error: {args.module_path} is not a directory', file=sys.stderr)
        return 2

    result = scan_module(args.module_path)
    output = json.dumps(result, indent=2)

    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output)
        print(f'Results written to {args.output}', file=sys.stderr)
    else:
        print(output)

    return 0 if result['status'] == 'pass' else 1


if __name__ == '__main__':
    sys.exit(main())
