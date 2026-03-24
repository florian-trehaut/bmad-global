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
      { name: 'core', version: '6.2.0', source: 'built-in' },
      { name: 'bmm', version: '6.2.0', source: 'built-in' },
    ];

    await installer.writeManifest(tmpManifestDir, testModules);

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

    // readManifest on non-existent dir returns null
    const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bmad-empty-'));
    const noManifest = await installer.readManifest(emptyDir);
    assert(noManifest === null, 'readManifest returns null when no manifest exists');
    await fs.remove(emptyDir);
  } finally {
    await fs.remove(tmpManifestDir);
  }

  // ============================================================
  // Suite 4: Full Install Flow (Integration, tmpdir)
  // ============================================================
  console.log(`\n${colors.yellow}Suite 4: Full Install Flow${colors.reset}\n`);

  const tmpInstallDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bmad-install-test-'));

  try {
    const installer = new GlobalInstaller({ targetDir: tmpInstallDir });

    // Fresh install (no existing installation)
    const result = await installer.install({ force: true });

    assert(result.success === true, 'install() returns success: true');
    assert(await fs.pathExists(path.join(tmpInstallDir, 'core')), 'core/ directory created');
    assert(await fs.pathExists(path.join(tmpInstallDir, 'bmm')), 'bmm/ directory created');
    assert(await fs.pathExists(path.join(tmpInstallDir, 'manifest.yaml')), 'manifest.yaml created');

    // Check SKILL.md files exist in core
    const coreFiles = await getFilesRecursive(path.join(tmpInstallDir, 'core'));
    const coreSkillFiles = coreFiles.filter((f) => f.endsWith('SKILL.md'));
    assert(coreSkillFiles.length > 0, `core/ contains SKILL.md files (found ${coreSkillFiles.length})`);

    // Check SKILL.md files exist in bmm
    const bmmFiles = await getFilesRecursive(path.join(tmpInstallDir, 'bmm'));
    const bmmSkillFiles = bmmFiles.filter((f) => f.endsWith('SKILL.md'));
    assert(bmmSkillFiles.length > 0, `bmm/ contains SKILL.md files (found ${bmmSkillFiles.length})`);

    // Check module.yaml was NOT copied (filtered out)
    const coreModuleYaml = coreFiles.filter((f) => path.basename(f) === 'module.yaml');
    assert(coreModuleYaml.length === 0, 'module.yaml not copied to core/ (filtered)');

    // Check root config.yaml was NOT copied (filtered out)
    const coreRootConfigYaml = path.join(tmpInstallDir, 'core', 'config.yaml');
    assert(!(await fs.pathExists(coreRootConfigYaml)), 'root config.yaml not copied to core/ (filtered)');

    // Verify manifest content
    const manifest = await installer.readManifest(tmpInstallDir);
    assert(manifest.installation.version !== undefined, 'installed manifest has version');
    assert(manifest.modules.length >= 2, 'installed manifest has at least core + bmm');

    // Re-install with force (overwrite)
    const result2 = await installer.install({ force: true });
    assert(result2.success === true, 'reinstall with force succeeds');

    // Install with missing module source should throw (zero fallback — TAC-5)
    const installerBadModule = new GlobalInstaller({ targetDir: tmpInstallDir, builtInModules: ['nonexistent-xyz'] });
    let threwOnMissing = false;
    try {
      await installerBadModule.install({ force: true });
    } catch (error) {
      threwOnMissing = true;
      assert(error.message.includes('nonexistent-xyz'), 'error message includes module name', `Got: ${error.message}`);
    }
    assert(threwOnMissing, 'install throws when module source not found (zero fallback)');
  } finally {
    await fs.remove(tmpInstallDir);
  }

  // ============================================================
  // Results
  // ============================================================
  console.log(`\n${colors.cyan}========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================${colors.reset}`);

  process.exit(failed > 0 ? 1 : 0);
}

async function getFilesRecursive(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getFilesRecursive(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

runTests().catch((error) => {
  console.error(`${colors.red}Test runner error: ${error.message}${colors.reset}`);
  if (error.stack) console.error(error.stack);
  process.exit(1);
});
