const path = require('node:path');
const fs = require('fs-extra');
const yaml = require('yaml');
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
