const prompts = require('../lib/prompts');
const { GlobalInstaller } = require('../installers/lib/core/global-installer');
const { getGlobalInstallPath } = require('../installers/lib/core/global-paths');

module.exports = {
  command: 'status',
  description: 'Display BMAD installation status and module versions',
  options: [],
  action: async () => {
    try {
      const installer = new GlobalInstaller();
      const targetDir = getGlobalInstallPath();
      const manifest = await installer.readManifest(targetDir);

      if (!manifest) {
        await prompts.log.warn('No BMAD installation found.');
        await prompts.log.message(`Expected location: ${targetDir}`);
        await prompts.log.message('Run "bmad install" to set up a new installation.');
        process.exit(0);
        return;
      }

      const installation = manifest.installation || {};
      const modules = manifest.modules || [];

      await prompts.intro('BMAD Status');

      const lines = [
        `Version: ${installation.version || 'unknown'}`,
        `Location: ${installation.targetPath || targetDir}`,
        `Installed: ${installation.installDate ? new Date(installation.installDate).toLocaleDateString() : 'unknown'}`,
        `Last updated: ${installation.lastUpdated ? new Date(installation.lastUpdated).toLocaleDateString() : 'unknown'}`,
        '',
        `Modules (${modules.length}):`,
        ...modules.map((m) => `  ${m.name} v${m.version || 'unknown'} (${m.source || 'unknown'})`),
      ];

      await prompts.note(lines.join('\n'), 'Installation');
      await prompts.outro('');

      process.exit(0);
    } catch (error) {
      await prompts.log.error(`Status check failed: ${error.message}`);
      process.exit(1);
    }
  },
};
