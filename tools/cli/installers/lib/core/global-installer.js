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
   * Each skill directory (containing SKILL.md) is installed flat at the top level
   * of the skills directory so Claude Code can discover them.
   *
   * @param {Object} options
   * @param {boolean} [options.force=false] - Skip confirmation on existing install
   * @param {boolean} [options.debug=false] - Enable debug output
   * @returns {Promise<{success: boolean, modules: string[], cancelled?: boolean, skillCount?: number}>}
   */
  async install({ force = false, debug = false } = {}) {
    const prompts = require('../../../lib/prompts');
    const targetDir = this.targetDir;
    const skillsDir = path.dirname(targetDir); // ~/.claude/skills/

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

      // Remove previously installed skills (tracked in manifest)
      await this.removeInstalledSkills(existingManifest, skillsDir);
    }

    // Ensure manifest directory exists
    await fs.ensureDir(targetDir);

    const installedModules = [];
    let totalSkillCount = 0;
    const installedSkillDirs = [];

    // Install each built-in module
    for (const moduleCode of this.builtInModules) {
      const sourcePath = await this.moduleManager.findModuleSource(moduleCode, { silent: true });

      if (!sourcePath) {
        throw new Error(`Source for module '${moduleCode}' not found. Cannot install without source files.`);
      }

      // Find all skill directories (containing SKILL.md) in the module source
      const skillDirs = await this.findSkillDirs(sourcePath);
      let moduleSkillCount = 0;

      for (const skillDir of skillDirs) {
        const skillName = path.basename(skillDir);
        const skillTargetPath = path.join(skillsDir, skillName);

        // Copy the skill directory flat to ~/.claude/skills/{skill-name}/
        await this.moduleManager.copyModuleWithFiltering(skillDir, skillTargetPath);
        installedSkillDirs.push(skillName);
        moduleSkillCount++;
      }

      totalSkillCount += moduleSkillCount;

      installedModules.push({
        name: moduleCode,
        version: packageJson.version,
        source: 'built-in',
        skillCount: moduleSkillCount,
        skills: skillDirs.map((d) => path.basename(d)),
      });

      if (debug) {
        await prompts.log.info(`Installed module: ${moduleCode} (${moduleSkillCount} skills)`);
      }
    }

    // Write manifest (tracks which skills were installed for cleanup)
    await this.writeManifest(targetDir, installedModules, installedSkillDirs);

    // Git commit + push if target is inside a git repo
    await this.gitCommitAndPush(skillsDir, prompts, debug);

    // Summary
    const moduleNames = installedModules.map((m) => m.name).join(', ');
    await prompts.log.success(
      `BMAD v${packageJson.version} installed — ${installedModules.length} modules (${moduleNames}), ${totalSkillCount} skills`,
    );
    await prompts.log.info(`Location: ${skillsDir}`);

    await prompts.log.warn('Next step: run /bmad-project-init in each project to set up workflow-context.md.');
    await prompts.log.message(
      'Then run /bmad-knowledge-bootstrap to generate workflow-knowledge files (project.md / domain.md / api.md) from planning artifacts and/or codebase.',
    );
    await prompts.log.message(
      'Both are required for all bmad-* workflows to function. Re-run /bmad-knowledge-refresh after each BMAD update to keep knowledge in sync.',
    );

    return {
      success: true,
      modules: installedModules.map((m) => m.name),
      skillCount: totalSkillCount,
    };
  }

  /**
   * Find all directories containing a SKILL.md file (recursively).
   * @param {string} basePath - Root directory to search
   * @returns {Promise<string[]>} Array of absolute paths to skill directories
   */
  async findSkillDirs(basePath) {
    const results = [];

    const walk = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      // Check if this directory contains SKILL.md
      if (entries.some((e) => e.isFile() && e.name === 'SKILL.md')) {
        results.push(dir);
        return; // Don't recurse into skill directories (they are leaf nodes)
      }

      // Recurse into subdirectories
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(path.join(dir, entry.name));
        }
      }
    };

    await walk(basePath);
    return results;
  }

  /**
   * Remove previously installed skill directories tracked in the manifest.
   * @param {Object} manifest - Parsed manifest object
   * @param {string} skillsDir - The ~/.claude/skills/ directory
   */
  async removeInstalledSkills(manifest, skillsDir) {
    const installedSkills = manifest.installedSkills || [];
    for (const skillName of installedSkills) {
      const skillPath = path.join(skillsDir, skillName);
      if (await fs.pathExists(skillPath)) {
        await fs.remove(skillPath);
      }
    }
    // Also remove the manifest directory (bmad/)
    const manifestDir = path.join(skillsDir, 'bmad');
    if (await fs.pathExists(manifestDir)) {
      await fs.remove(manifestDir);
    }
  }

  /**
   * Write manifest to target directory.
   * @param {string} targetDir - Directory to write manifest into (bmad/)
   * @param {Array<{name: string, version: string, source: string, skills: string[]}>} modules
   * @param {string[]} installedSkillDirs - All skill directory names installed
   */
  async writeManifest(targetDir, modules, installedSkillDirs) {
    const manifestPath = path.join(targetDir, 'manifest.yaml');
    const now = new Date().toISOString();

    const manifest = {
      installation: {
        version: packageJson.version,
        installDate: now,
        lastUpdated: now,
        targetPath: path.dirname(targetDir),
      },
      modules,
      installedSkills: installedSkillDirs,
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
