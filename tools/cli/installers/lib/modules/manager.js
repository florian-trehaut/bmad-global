const path = require('node:path');
const fs = require('fs-extra');
const { getProjectRoot, getSourcePath } = require('../../../lib/project-root');
const { ExternalModuleManager } = require('./external-manager');

/**
 * Manages module discovery and file copying for BMAD installations.
 *
 * @class ModuleManager
 */
class ModuleManager {
  constructor() {
    this.customModulePaths = new Map();
    this.externalModuleManager = new ExternalModuleManager();
  }

  /**
   * Find the source path for a module by searching all possible locations.
   * @param {string} moduleCode - Code of the module to find
   * @param {Object} [options]
   * @param {boolean} [options.silent] - Suppress spinner output
   * @returns {Promise<string|null>} Path to the module source or null
   */
  async findModuleSource(moduleCode, options = {}) {
    // Check custom module paths
    if (this.customModulePaths && this.customModulePaths.has(moduleCode)) {
      return this.customModulePaths.get(moduleCode);
    }

    // Built-in core module
    if (moduleCode === 'core') {
      const corePath = getSourcePath('core-skills');
      if (await fs.pathExists(corePath)) {
        return corePath;
      }
    }

    // Built-in bmm module
    if (moduleCode === 'bmm') {
      const bmmPath = getSourcePath('bmm-skills');
      if (await fs.pathExists(bmmPath)) {
        return bmmPath;
      }
    }

    // External official modules
    const externalSource = await this.findExternalModuleSource(moduleCode, options);
    if (externalSource) {
      return externalSource;
    }

    return null;
  }

  /**
   * Check if a module is an external official module.
   * @param {string} moduleCode
   * @returns {Promise<boolean>}
   */
  async isExternalModule(moduleCode) {
    return await this.externalModuleManager.hasModule(moduleCode);
  }

  /**
   * Get the cache directory for external modules.
   * @returns {string}
   */
  getExternalCacheDir() {
    const os = require('node:os');
    return path.join(os.homedir(), '.bmad', 'cache', 'external-modules');
  }

  /**
   * Clone an external module repository to cache.
   * Uses execSync with hardcoded URLs from external-official-modules.yaml (not user input).
   * @param {string} moduleCode
   * @param {Object} [options]
   * @returns {Promise<string>} Path to the cloned repository
   */
  async cloneExternalModule(moduleCode, options = {}) {
    const { execSync } = require('node:child_process');
    const prompts = require('../../../lib/prompts');
    const moduleInfo = await this.externalModuleManager.getModuleByCode(moduleCode);

    if (!moduleInfo) {
      throw new Error(`External module '${moduleCode}' not found in external-official-modules.yaml`);
    }

    const cacheDir = this.getExternalCacheDir();
    const moduleCacheDir = path.join(cacheDir, moduleCode);
    const silent = options.silent || false;

    await fs.ensureDir(cacheDir);

    const createSpinner = async () => {
      if (silent) {
        return { start() {}, stop() {}, error() {} };
      }
      return await prompts.spinner();
    };

    let needsDependencyInstall = false;
    let wasNewClone = false;

    if (await fs.pathExists(moduleCacheDir)) {
      const fetchSpinner = await createSpinner();
      fetchSpinner.start(`Fetching ${moduleInfo.name}...`);
      try {
        const currentRef = execSync('git rev-parse HEAD', { cwd: moduleCacheDir, stdio: 'pipe' }).toString().trim();
        execSync('git fetch origin --depth 1', {
          cwd: moduleCacheDir,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        });
        execSync('git reset --hard origin/HEAD', {
          cwd: moduleCacheDir,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        });
        const newRef = execSync('git rev-parse HEAD', { cwd: moduleCacheDir, stdio: 'pipe' }).toString().trim();
        fetchSpinner.stop(`Fetched ${moduleInfo.name}`);
        if (currentRef !== newRef) {
          needsDependencyInstall = true;
        }
      } catch {
        fetchSpinner.error(`Fetch failed, re-downloading ${moduleInfo.name}`);
        await fs.remove(moduleCacheDir);
        wasNewClone = true;
      }
    } else {
      wasNewClone = true;
    }

    if (wasNewClone) {
      const fetchSpinner = await createSpinner();
      fetchSpinner.start(`Fetching ${moduleInfo.name}...`);
      try {
        // URL comes from external-official-modules.yaml, not user input
        execSync(`git clone --depth 1 "${moduleInfo.url}" "${moduleCacheDir}"`, {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
        });
        fetchSpinner.stop(`Fetched ${moduleInfo.name}`);
      } catch (error) {
        fetchSpinner.error(`Failed to fetch ${moduleInfo.name}`);
        throw new Error(`Failed to clone external module '${moduleCode}': ${error.message}`);
      }
    }

    // Install npm dependencies if needed
    const packageJsonPath = path.join(moduleCacheDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const nodeModulesMissing = !(await fs.pathExists(path.join(moduleCacheDir, 'node_modules')));
      if (needsDependencyInstall || wasNewClone || nodeModulesMissing) {
        const installSpinner = await createSpinner();
        installSpinner.start(`Installing dependencies for ${moduleInfo.name}...`);
        try {
          execSync('npm install --omit=dev --no-audit --no-fund --no-progress --legacy-peer-deps', {
            cwd: moduleCacheDir,
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 120_000,
          });
          installSpinner.stop(`Installed dependencies for ${moduleInfo.name}`);
        } catch (error) {
          installSpinner.error(`Failed to install dependencies for ${moduleInfo.name}`);
          if (!silent) await prompts.log.warn(`  ${error.message}`);
        }
      }
    }

    return moduleCacheDir;
  }

  /**
   * Find the source path for an external module.
   * @param {string} moduleCode
   * @param {Object} [options]
   * @returns {Promise<string|null>}
   */
  async findExternalModuleSource(moduleCode, options = {}) {
    const moduleInfo = await this.externalModuleManager.getModuleByCode(moduleCode);
    if (!moduleInfo) {
      return null;
    }

    const cloneDir = await this.cloneExternalModule(moduleCode, options);
    const moduleDefinitionPath = moduleInfo.moduleDefinition;
    const configuredPath = path.join(cloneDir, moduleDefinitionPath);

    if (await fs.pathExists(configuredPath)) {
      return path.dirname(configuredPath);
    }

    // Fallback: search skills/ and src/ (root level and one level deep)
    for (const dir of ['skills', 'src']) {
      const rootCandidate = path.join(cloneDir, dir, 'module.yaml');
      if (await fs.pathExists(rootCandidate)) {
        return path.dirname(rootCandidate);
      }
      const dirPath = path.join(cloneDir, dir);
      if (await fs.pathExists(dirPath)) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const subCandidate = path.join(dirPath, entry.name, 'module.yaml');
            if (await fs.pathExists(subCandidate)) {
              return path.dirname(subCandidate);
            }
          }
        }
      }
    }

    // Check repo root as last fallback
    const rootCandidate = path.join(cloneDir, 'module.yaml');
    if (await fs.pathExists(rootCandidate)) {
      return path.dirname(rootCandidate);
    }

    // Nothing found: return configured path (preserves behavior for error messaging)
    return path.dirname(configuredPath);
  }

  /**
   * Copy module files with filtering (skips sub-modules/, sidecar dirs, module.yaml,
   * root config.yaml, and web-only agents with localskip="true").
   * @param {string} sourcePath - Source module path
   * @param {string} targetPath - Target module path
   * @param {Function} [fileTrackingCallback] - Optional callback to track installed files
   * @param {Object} [moduleConfig] - Module configuration with conditional flags
   */
  async copyModuleWithFiltering(sourcePath, targetPath, fileTrackingCallback = null, moduleConfig = {}) {
    const sourceFiles = await this.getFileList(sourcePath);

    for (const file of sourceFiles) {
      if (file.startsWith('sub-modules/')) continue;

      const isInSidecarDirectory = path
        .dirname(file)
        .split('/')
        .some((dir) => dir.toLowerCase().endsWith('-sidecar'));
      if (isInSidecarDirectory) continue;

      if (file === 'module.yaml') continue;
      if (file === 'config.yaml') continue;

      const sourceFile = path.join(sourcePath, file);
      const targetFile = path.join(targetPath, file);

      // Skip web-only agents
      if (file.startsWith('agents/') && file.endsWith('.md')) {
        const content = await fs.readFile(sourceFile, 'utf8');
        if (/<agent[^>]*\slocalskip="true"[^>]*>/.test(content)) {
          continue;
        }
      }

      await fs.ensureDir(path.dirname(targetFile));
      await fs.copy(sourceFile, targetFile, { overwrite: true });

      if (fileTrackingCallback) {
        fileTrackingCallback(targetFile);
      }
    }
  }

  /**
   * Get list of all files in a directory recursively.
   * @param {string} dir - Directory path
   * @param {string} [baseDir] - Base directory for relative paths
   * @returns {Promise<string[]>} List of relative file paths
   */
  async getFileList(dir, baseDir = dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.getFileList(fullPath, baseDir)));
      } else {
        files.push(path.relative(baseDir, fullPath));
      }
    }

    return files;
  }
}

module.exports = { ModuleManager };
