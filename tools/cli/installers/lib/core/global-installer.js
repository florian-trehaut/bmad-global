const path = require('node:path');
const fs = require('fs-extra');
const yaml = require('yaml');
const { execFileSync } = require('node:child_process');
const { getGlobalInstallPath, getBuiltInModules } = require('./global-paths');
const { ModuleManager } = require('../modules/manager');

const packageJson = require('../../../../../package.json');

class GlobalInstaller {
  /**
   * @param {Object} options
   * @param {string} [options.targetDir] - Override install target (for testing)
   * @param {string[]} [options.builtInModules] - Override built-in module list (for testing)
   * @param {ModuleManager} [options.moduleManager] - Override module manager (for testing)
   */
  constructor(options = {}) {
    this.targetDir = options.targetDir || getGlobalInstallPath();
    this.builtInModules = options.builtInModules || getBuiltInModules();
    this.moduleManager = options.moduleManager || new ModuleManager();
  }

  /**
   * Install all modules to the global skills directory.
   * @param {Object} options
   * @param {boolean} [options.force=false] - Skip confirmation on existing install
   * @param {boolean} [options.debug=false] - Enable debug output
   * @returns {Promise<{success: boolean, modules: string[], cancelled?: boolean}>}
   */
  async install({ force = false, debug = false } = {}) {
    const prompts = require('../../../lib/prompts');
    const targetDir = this.targetDir;

    // Check for existing installation
    const existingManifest = await this.readManifest(targetDir);
    if (existingManifest) {
      const existingVersion = existingManifest.installation?.version || 'unknown';

      if (!force) {
        const confirmed = await prompts.confirm({
          message: `BMAD v${existingVersion} is already installed. Overwrite?`,
        });

        if (!confirmed) {
          await prompts.log.warn('Installation cancelled.');
          return { success: false, cancelled: true, modules: [] };
        }
      }

      // Remove existing installation
      await fs.remove(targetDir);
    }

    // Create target directory
    await fs.ensureDir(targetDir);

    const installedModules = [];

    // Install each built-in module
    for (const moduleCode of this.builtInModules) {
      const sourcePath = await this.moduleManager.findModuleSource(moduleCode, { silent: true });

      if (!sourcePath) {
        throw new Error(`Source for module '${moduleCode}' not found. Cannot install without source files.`);
      }

      const moduleTargetPath = path.join(targetDir, moduleCode);
      await this.moduleManager.copyModuleWithFiltering(sourcePath, moduleTargetPath);

      installedModules.push({
        name: moduleCode,
        version: packageJson.version,
        source: 'built-in',
      });

      if (debug) {
        await prompts.log.info(`Installed module: ${moduleCode} → ${moduleTargetPath}`);
      }
    }

    // Write manifest
    await this.writeManifest(targetDir, installedModules);

    // Git commit + push if target is inside a git repo
    await this.gitCommitAndPush(targetDir, prompts, debug);

    // Summary
    const moduleNames = installedModules.map((m) => m.name).join(', ');
    await prompts.log.success(`BMAD v${packageJson.version} installed — ${installedModules.length} modules (${moduleNames})`);
    await prompts.log.info(`Location: ${targetDir}`);

    return {
      success: true,
      modules: installedModules.map((m) => m.name),
    };
  }

  /**
   * Write manifest to target directory.
   * @param {string} targetDir - Directory to write manifest into
   * @param {Array<{name: string, version: string, source: string}>} modules - Installed modules
   */
  async writeManifest(targetDir, modules) {
    const manifestPath = path.join(targetDir, 'manifest.yaml');
    const now = new Date().toISOString();

    const manifest = {
      installation: {
        version: packageJson.version,
        installDate: now,
        lastUpdated: now,
        targetPath: targetDir,
      },
      modules,
    };

    const yamlContent = yaml.stringify(manifest, { lineWidth: 0 });
    await fs.ensureDir(targetDir);
    await fs.writeFile(manifestPath, yamlContent, 'utf8');
  }

  /**
   * Git commit and push the installed skills if the target directory is inside a git repo.
   * Silently skips if not in a git repo or if git operations fail.
   * @param {string} targetDir - The installation directory
   * @param {Object} prompts - Prompts module for logging
   * @param {boolean} debug - Whether to show debug output
   */
  async gitCommitAndPush(targetDir, prompts, debug) {
    try {
      // Check if targetDir is inside a git repo
      const gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
        cwd: targetDir,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      if (!gitRoot) return;

      // Stage the skills directory
      execFileSync('git', ['add', targetDir], { cwd: gitRoot, stdio: 'pipe' });

      // Check if there are staged changes
      try {
        execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: gitRoot, stdio: 'pipe' });
        // Exit code 0 = no changes staged, nothing to commit
        if (debug) await prompts.log.info('No changes to commit.');
        return;
      } catch {
        // Exit code 1 = changes staged, proceed with commit
      }

      // Commit
      const commitMsg = `chore(bmad): update skills to v${packageJson.version}`;
      execFileSync('git', ['commit', '-m', commitMsg], { cwd: gitRoot, stdio: 'pipe' });

      // Push (best-effort — don't fail the install if push fails)
      try {
        execFileSync('git', ['push'], { cwd: gitRoot, stdio: 'pipe', timeout: 15_000 });
        if (debug) await prompts.log.info('Git commit and push complete.');
      } catch (error) {
        await prompts.log.warn(`Git commit created but push failed: ${error.message}`);
      }
    } catch {
      // Not in a git repo or git not available — silently skip
      if (debug) await prompts.log.info('Target directory is not in a git repo — skipping git commit.');
    }
  }

  /**
   * Read manifest from target directory.
   * @param {string} targetDir - Directory containing manifest.yaml
   * @returns {Promise<Object|null>} Parsed manifest or null if not found
   */
  async readManifest(targetDir) {
    const manifestPath = path.join(targetDir, 'manifest.yaml');

    if (!(await fs.pathExists(manifestPath))) {
      return null;
    }

    const content = await fs.readFile(manifestPath, 'utf8');
    return yaml.parse(content);
  }
}

module.exports = { GlobalInstaller };
