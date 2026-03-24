/**
 * Global Installer Tests
 *
 * Tests for the global installation flow:
 * - Path resolution (unit)
 * - Module source discovery (unit)
 * - Manifest read/write (unit, tmpdir)
 * - Full install flow (integration, tmpdir)
 *
 * Usage: node test/test-global-installer.js
 */

const path = require('node:path');
const os = require('node:os');
const fs = require('fs-extra');

// ANSI colors
const colors = {
  reset: '\u001B[0m',
  green: '\u001B[32m',
  red: '\u001B[31m',
  yellow: '\u001B[33m',
  cyan: '\u001B[36m',
  dim: '\u001B[2m',
};

let passed = 0;
let failed = 0;

function assert(condition, testName, errorMessage = '') {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    passed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (errorMessage) {
      console.log(`  ${colors.dim}${errorMessage}${colors.reset}`);
    }
    failed++;
  }
}

async function runTests() {
  console.log(`${colors.cyan}========================================`);
  console.log('Global Installer Tests');
  console.log(`========================================${colors.reset}\n`);

  // ============================================================
  // Suite 1: Path Resolution (Unit)
  // ============================================================
  console.log(`${colors.yellow}Suite 1: Path Resolution${colors.reset}\n`);

  const { getGlobalInstallPath, getManifestPath, getBuiltInModules } = require('../tools/cli/installers/lib/core/global-paths');

  const expectedBase = path.join(os.homedir(), '.claude', 'skills', 'bmad');

  assert(
    getGlobalInstallPath() === expectedBase,
    'getGlobalInstallPath() returns ~/.claude/skills/bmad',
    `Got: ${getGlobalInstallPath()}, Expected: ${expectedBase}`,
  );

  assert(
    getManifestPath() === path.join(expectedBase, 'manifest.yaml'),
    'getManifestPath() returns ~/.claude/skills/bmad/manifest.yaml',
    `Got: ${getManifestPath()}`,
  );

  const builtIn = getBuiltInModules();
  assert(Array.isArray(builtIn) && builtIn.length === 2, 'getBuiltInModules() returns array of 2 items');
  assert(builtIn[0] === 'core', 'getBuiltInModules()[0] is core');
  assert(builtIn[1] === 'bmm', 'getBuiltInModules()[1] is bmm');

  // ============================================================
  // Suite 2: Module Source Discovery (Unit)
  // ============================================================
  console.log(`\n${colors.yellow}Suite 2: Module Source Discovery${colors.reset}\n`);

  const { ModuleManager } = require('../tools/cli/installers/lib/modules/manager');
  const manager = new ModuleManager();

  const coreSource = await manager.findModuleSource('core');
  assert(coreSource !== null, 'findModuleSource("core") returns a path');
  if (coreSource) {
    assert(await fs.pathExists(coreSource), 'core source path exists on disk', `Path: ${coreSource}`);
    assert(coreSource.endsWith('core-skills'), 'core source path ends with core-skills', `Path: ${coreSource}`);
  }

  const bmmSource = await manager.findModuleSource('bmm');
  assert(bmmSource !== null, 'findModuleSource("bmm") returns a path');
  if (bmmSource) {
    assert(await fs.pathExists(bmmSource), 'bmm source path exists on disk', `Path: ${bmmSource}`);
    assert(bmmSource.endsWith('bmm-skills'), 'bmm source path ends with bmm-skills', `Path: ${bmmSource}`);
  }

  const nonExistent = await manager.findModuleSource('nonexistent-module-xyz', { silent: true });
  assert(nonExistent === null, 'findModuleSource("nonexistent") returns null');

  // ============================================================
  // Suite 3: Manifest Read/Write (Unit, tmpdir)
  // ============================================================
  console.log(`\n${colors.yellow}Suite 3: Manifest Read/Write${colors.reset}\n`);

  const { GlobalInstaller } = require('../tools/cli/installers/lib/core/global-installer');

  const tmpManifestDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bmad-manifest-test-'));

  try {
    const installer = new GlobalInstaller();
    const testModules = [
      { name: 'core', version: '6.2.0', source: 'built-in', skills: [] },
      { name: 'bmm', version: '6.2.0', source: 'built-in', skills: [] },
    ];

    await installer.writeManifest(tmpManifestDir, testModules, []);

    const manifestPath = path.join(tmpManifestDir, 'manifest.yaml');
    assert(await fs.pathExists(manifestPath), 'writeManifest creates manifest.yaml at target path');

    const manifest = await installer.readManifest(tmpManifestDir);
    assert(manifest !== null, 'readManifest returns parsed object');
    assert(manifest.installation !== undefined, 'manifest has installation section');
    assert(manifest.installation.version !== undefined, 'manifest has version');
    assert(manifest.installation.targetPath !== undefined, 'manifest has targetPath');
    assert(Array.isArray(manifest.modules), 'manifest has modules array');
    assert(manifest.modules.length === 2, 'manifest has 2 modules');
    assert(manifest.modules[0].name === 'core', 'first module is core');
    assert(manifest.modules[1].name === 'bmm', 'second module is bmm');
    assert(manifest.modules[0].source === 'built-in', 'core module source is built-in');
    assert(Array.isArray(manifest.installedSkills), 'manifest has installedSkills array');

    // readManifest on non-existent dir returns null
    const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bmad-empty-'));
    const noManifest = await installer.readManifest(emptyDir);
    assert(noManifest === null, 'readManifest returns null when no manifest exists');
    await fs.remove(emptyDir);
  } finally {
    await fs.remove(tmpManifestDir);
  }

  // ============================================================
  // Suite 4: Full Install Flow — Flat Layout (Integration, tmpdir)
  // ============================================================
  console.log(`\n${colors.yellow}Suite 4: Full Install Flow${colors.reset}\n`);

  // Create a tmpdir that simulates ~/.claude/skills/
  // targetDir = tmpdir/bmad (manifest location)
  // skills install to tmpdir/{skill-name}/ (flat)
  const tmpSkillsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bmad-install-test-'));
  const tmpTargetDir = path.join(tmpSkillsDir, 'bmad');

  try {
    const installer = new GlobalInstaller({ targetDir: tmpTargetDir });

    // Fresh install
    const result = await installer.install({ force: true });

    assert(result.success === true, 'install() returns success: true');
    assert(result.skillCount > 0, `install() reports skillCount > 0 (got ${result.skillCount})`);

    // Manifest exists in bmad/
    assert(await fs.pathExists(path.join(tmpTargetDir, 'manifest.yaml')), 'manifest.yaml created in bmad/');

    // Skills installed flat at top level
    const topLevelDirs = (await fs.readdir(tmpSkillsDir, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

    const bmadSkills = topLevelDirs.filter((d) => d.startsWith('bmad-'));
    assert(bmadSkills.length > 0, `bmad-* skill directories at top level (found ${bmadSkills.length})`);

    // Check a known core skill is at top level
    assert(topLevelDirs.includes('bmad-shared'), 'bmad-shared installed at top level');
    assert(topLevelDirs.includes('bmad-knowledge-bootstrap'), 'bmad-knowledge-bootstrap installed at top level');

    // Check SKILL.md exists in a top-level skill
    assert(await fs.pathExists(path.join(tmpSkillsDir, 'bmad-shared', 'SKILL.md')), 'bmad-shared/SKILL.md exists at top level');

    // Check that skills are NOT nested in core/ or bmm/
    assert(!(await fs.pathExists(path.join(tmpTargetDir, 'core'))), 'no core/ subdirectory in bmad/ (flat layout)');
    assert(!(await fs.pathExists(path.join(tmpTargetDir, 'bmm'))), 'no bmm/ subdirectory in bmad/ (flat layout)');

    // Manifest tracks installed skills
    const manifest = await installer.readManifest(tmpTargetDir);
    assert(manifest.installation.version !== undefined, 'manifest has version');
    assert(manifest.modules.length >= 2, 'manifest has at least core + bmm modules');
    assert(manifest.installedSkills.length > 0, `manifest tracks ${manifest.installedSkills.length} installed skills`);
    assert(manifest.installedSkills.includes('bmad-shared'), 'manifest tracks bmad-shared');

    // Re-install with force (overwrite) — should clean previous skills
    const result2 = await installer.install({ force: true });
    assert(result2.success === true, 'reinstall with force succeeds');
    assert(result2.skillCount > 0, 'reinstall reports skills installed');

    // Install with missing module source should throw (zero fallback)
    const installerBadModule = new GlobalInstaller({ targetDir: tmpTargetDir, builtInModules: ['nonexistent-xyz'] });
    let threwOnMissing = false;
    try {
      await installerBadModule.install({ force: true });
    } catch (error) {
      threwOnMissing = true;
      assert(error.message.includes('nonexistent-xyz'), 'error message includes module name', `Got: ${error.message}`);
    }
    assert(threwOnMissing, 'install throws when module source not found (zero fallback)');
  } finally {
    await fs.remove(tmpSkillsDir);
  }

  // ============================================================
  // Results
  // ============================================================
  console.log(`\n${colors.cyan}========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================${colors.reset}`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((error) => {
  console.error(`${colors.red}Test runner error: ${error.message}${colors.reset}`);
  if (error.stack) console.error(error.stack);
  process.exit(1);
});
