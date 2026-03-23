#!/usr/bin/env python3
"""Unit tests for scan-module-structure.py."""

# /// script
# requires-python = ">=3.9"
# dependencies = ["pyyaml"]
# ///

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

# Add parent directory to path for import
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import using importlib since the filename has hyphens
import importlib.util

spec = importlib.util.spec_from_file_location(
    'scan_module_structure',
    Path(__file__).parent.parent / 'scan-module-structure.py',
)
assert spec is not None and spec.loader is not None
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

scan_module = mod.scan_module
check_module_yaml = mod.check_module_yaml
check_required_files = mod.check_required_files
check_agent_files = mod.check_agent_files
check_workflow_dirs = mod.check_workflow_dirs
check_absolute_paths = mod.check_absolute_paths


class TestCheckModuleYaml(unittest.TestCase):
    """Tests for module.yaml validation."""

    def test_missing_module_yaml(self):
        with tempfile.TemporaryDirectory() as td:
            findings = check_module_yaml(Path(td))
            self.assertEqual(len(findings), 1)
            self.assertEqual(findings[0]['severity'], 'critical')
            self.assertIn('missing', findings[0]['title'].lower())

    def test_valid_module_yaml(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / 'module.yaml'
            p.write_text(
                'code: test-module\n'
                'name: "Test Module"\n'
                'header: "A test module"\n'
                'subheader: "For testing"\n'
                'default_selected: false\n'
            )
            findings = check_module_yaml(Path(td))
            self.assertEqual(len(findings), 0)

    def test_missing_required_fields(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / 'module.yaml'
            p.write_text('code: test\n')
            findings = check_module_yaml(Path(td))
            missing = [f['title'] for f in findings]
            self.assertTrue(any('name' in t for t in missing))
            self.assertTrue(any('header' in t for t in missing))

    def test_invalid_code_format(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / 'module.yaml'
            p.write_text(
                'code: InvalidCode\n'
                'name: "Test"\n'
                'header: "Test"\n'
                'subheader: "Test"\n'
                'default_selected: false\n'
            )
            findings = check_module_yaml(Path(td))
            self.assertTrue(any('kebab-case' in f['title'] for f in findings))

    def test_code_too_short(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / 'module.yaml'
            p.write_text(
                'code: x\n'
                'name: "Test"\n'
                'header: "Test"\n'
                'subheader: "Test"\n'
                'default_selected: false\n'
            )
            findings = check_module_yaml(Path(td))
            self.assertTrue(any('length' in f['title'] for f in findings))

    def test_invalid_yaml_syntax(self):
        with tempfile.TemporaryDirectory() as td:
            p = Path(td) / 'module.yaml'
            p.write_text('code: [\ninvalid yaml')
            findings = check_module_yaml(Path(td))
            self.assertEqual(len(findings), 1)
            self.assertEqual(findings[0]['severity'], 'critical')
            self.assertIn('parse', findings[0]['category'])


class TestCheckRequiredFiles(unittest.TestCase):
    """Tests for required file presence."""

    def test_missing_readme(self):
        with tempfile.TemporaryDirectory() as td:
            findings = check_required_files(Path(td))
            self.assertEqual(len(findings), 1)
            self.assertIn('README', findings[0]['title'])

    def test_readme_present(self):
        with tempfile.TemporaryDirectory() as td:
            (Path(td) / 'README.md').write_text('# Module')
            findings = check_required_files(Path(td))
            self.assertEqual(len(findings), 0)


class TestCheckAgentFiles(unittest.TestCase):
    """Tests for agent file naming."""

    def test_no_agents_dir(self):
        with tempfile.TemporaryDirectory() as td:
            findings = check_agent_files(Path(td))
            self.assertEqual(len(findings), 0)

    def test_valid_agent_files(self):
        with tempfile.TemporaryDirectory() as td:
            agents = Path(td) / 'agents'
            agents.mkdir()
            (agents / 'cheese-master.agent.yaml').write_text('id: test')
            (agents / 'quality-inspector.agent.md').write_text('# Agent')
            (agents / 'helper.agent.spec.md').write_text('# Spec')
            findings = check_agent_files(Path(td))
            self.assertEqual(len(findings), 0)

    def test_invalid_agent_naming(self):
        with tempfile.TemporaryDirectory() as td:
            agents = Path(td) / 'agents'
            agents.mkdir()
            (agents / 'BadName.yaml').write_text('id: test')
            findings = check_agent_files(Path(td))
            self.assertEqual(len(findings), 1)
            self.assertIn('naming', findings[0]['category'])


class TestCheckWorkflowDirs(unittest.TestCase):
    """Tests for workflow directory validation."""

    def test_no_workflows_dir(self):
        with tempfile.TemporaryDirectory() as td:
            findings = check_workflow_dirs(Path(td))
            self.assertEqual(len(findings), 0)

    def test_valid_workflow_with_workflow_md(self):
        with tempfile.TemporaryDirectory() as td:
            wf = Path(td) / 'workflows' / 'market-research'
            wf.mkdir(parents=True)
            (wf / 'workflow.md').write_text('# Workflow')
            findings = check_workflow_dirs(Path(td))
            self.assertEqual(len(findings), 0)

    def test_valid_workflow_with_spec(self):
        with tempfile.TemporaryDirectory() as td:
            wf = Path(td) / 'workflows' / 'market-research'
            wf.mkdir(parents=True)
            (wf / 'market-research.spec.md').write_text('# Spec')
            findings = check_workflow_dirs(Path(td))
            self.assertEqual(len(findings), 0)

    def test_empty_workflow_dir(self):
        with tempfile.TemporaryDirectory() as td:
            wf = Path(td) / 'workflows' / 'empty-workflow'
            wf.mkdir(parents=True)
            findings = check_workflow_dirs(Path(td))
            self.assertEqual(len(findings), 1)
            self.assertEqual(findings[0]['severity'], 'high')
            self.assertIn('empty', findings[0]['title'].lower())

    def test_workflow_without_entry_point(self):
        with tempfile.TemporaryDirectory() as td:
            wf = Path(td) / 'workflows' / 'some-workflow'
            wf.mkdir(parents=True)
            (wf / 'data.md').write_text('# Data')
            findings = check_workflow_dirs(Path(td))
            self.assertEqual(len(findings), 1)
            self.assertIn('entry point', findings[0]['title'].lower())


class TestCheckAbsolutePaths(unittest.TestCase):
    """Tests for absolute path detection."""

    def test_no_absolute_paths(self):
        with tempfile.TemporaryDirectory() as td:
            (Path(td) / 'README.md').write_text(
                '# Module\nUse {project-root}/_bmad/ for paths.'
            )
            findings = check_absolute_paths(Path(td))
            self.assertEqual(len(findings), 0)

    def test_detects_absolute_path(self):
        with tempfile.TemporaryDirectory() as td:
            (Path(td) / 'README.md').write_text(
                '# Module\nSee /Users/john/projects/foo for details.'
            )
            findings = check_absolute_paths(Path(td))
            self.assertEqual(len(findings), 1)
            self.assertEqual(findings[0]['category'], 'absolute-path')

    def test_detects_home_path(self):
        with tempfile.TemporaryDirectory() as td:
            (Path(td) / 'README.md').write_text(
                '# Module\nConfig at ~/projects/foo.'
            )
            findings = check_absolute_paths(Path(td))
            self.assertEqual(len(findings), 1)


class TestScanModule(unittest.TestCase):
    """Integration tests for full module scan."""

    def test_complete_valid_module(self):
        with tempfile.TemporaryDirectory() as td:
            mp = Path(td)
            (mp / 'module.yaml').write_text(
                'code: test-mod\n'
                'name: "Test Module"\n'
                'header: "A test"\n'
                'subheader: "For testing"\n'
                'default_selected: false\n'
            )
            (mp / 'README.md').write_text('# Test Module')
            agents = mp / 'agents'
            agents.mkdir()
            (agents / 'helper.agent.yaml').write_text('id: helper')
            wf = mp / 'workflows' / 'example'
            wf.mkdir(parents=True)
            (wf / 'workflow.md').write_text('# Example')

            result = scan_module(mp)
            self.assertEqual(result['status'], 'pass')
            self.assertEqual(result['summary']['total_findings'], 0)

    def test_empty_directory(self):
        with tempfile.TemporaryDirectory() as td:
            result = scan_module(Path(td))
            self.assertEqual(result['status'], 'fail')
            critical = result['summary']['by_severity']['critical']
            self.assertGreater(critical, 0)

    def test_output_schema(self):
        with tempfile.TemporaryDirectory() as td:
            (Path(td) / 'module.yaml').write_text('code: test\nname: "T"\nheader: "T"\nsubheader: "T"\ndefault_selected: false\n')
            (Path(td) / 'README.md').write_text('# T')
            result = scan_module(Path(td))

            # Validate schema
            self.assertIn('scanner', result)
            self.assertIn('findings', result)
            self.assertIn('assessments', result)
            self.assertIn('summary', result)
            self.assertIsInstance(result['findings'], list)
            self.assertIsInstance(result['assessments'], dict)

            # Validate finding schema if any
            for finding in result['findings']:
                self.assertIn('file', finding)
                self.assertIn('severity', finding)
                self.assertIn('category', finding)
                self.assertIn('title', finding)
                self.assertIn('detail', finding)
                self.assertIn('action', finding)


if __name__ == '__main__':
    unittest.main()
