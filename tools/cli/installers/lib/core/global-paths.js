const path = require('node:path');
const os = require('node:os');

/**
 * Returns the global installation path for BMAD skills.
 * @returns {string} Absolute path to ~/.claude/skills/bmad
 */
function getGlobalInstallPath() {
  return path.join(os.homedir(), '.claude', 'skills', 'bmad');
}

/**
 * Returns the path to the global manifest file.
 * @returns {string} Absolute path to ~/.claude/skills/bmad/manifest.yaml
 */
function getManifestPath() {
  return path.join(getGlobalInstallPath(), 'manifest.yaml');
}

/**
 * Returns the list of built-in modules that are always installed.
 * @returns {string[]} Array of module codes
 */
function getBuiltInModules() {
  return ['core', 'bmm'];
}

module.exports = { getGlobalInstallPath, getManifestPath, getBuiltInModules };
