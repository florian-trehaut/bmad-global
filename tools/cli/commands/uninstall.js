const fs = require('fs-extra');
const prompts = require('../lib/prompts');
const { GlobalInstaller } = require('../installers/lib/core/global-installer');
const { getGlobalInstallPath } = require('../installers/lib/core/global-paths');

module.exports = {
  command: 'uninstall',
  description: 'Remove BMAD global installation',
  options: [
    ['-f, --force', 'Remove without confirmation'],
    ['-d, --debug', 'Enable debug output'],
  ],
  action: async (options) => {
    try {
      const targetDir = getGlobalInstallPath();

      if (!(await fs.pathExists(targetDir))) {
        await prompts.log.warn('No BMAD installation found.');
        await prompts.log.message(`Expected location: ${targetDir}`);
        process.exit(0);
        return;
      }

      // Show current installation info
      const installer = new GlobalInstaller();
      const manifest = await installer.readManifest(targetDir);
      const version = manifest?.installation?.version || 'unknown';
      const modules = (manifest?.modules || []).map((m) => m.name).join(', ');

      await prompts.intro('BMAD Uninstall');
      await prompts.note(`Version: ${version}\nModules: ${modules}\nLocation: ${targetDir}`, 'Current Installation');

      if (!options.force) {
        const confirmed = await prompts.confirm({
          message: 'Remove BMAD global installation? This cannot be undone.',
          initialValue: false,
        });

        if (!confirmed) {
          await prompts.outro('Uninstall cancelled.');
          process.exit(0);
          return;
        }
      }

      await fs.remove(targetDir);

      await prompts.log.success('BMAD global installation removed.');
      await prompts.outro('To reinstall, run: bmad install');

      process.exit(0);
    } catch (error) {
      try {
        await prompts.log.error(`Uninstall failed: ${error.message}`);
        if (options.debug && error.stack) {
          await prompts.log.message(error.stack);
        }
      } catch {
        console.error(error.message || error);
      }
      process.exit(1);
    }
  },
};
