const prompts = require('../lib/prompts');
const { GlobalInstaller } = require('../installers/lib/core/global-installer');

module.exports = {
  command: 'install',
  description: 'Install BMAD skills globally for Claude Code',
  options: [
    ['-f, --force', 'Overwrite existing installation without confirmation'],
    ['-d, --debug', 'Enable debug output'],
  ],
  action: async (options) => {
    try {
      const installer = new GlobalInstaller();
      const result = await installer.install({
        force: options.force,
        debug: options.debug,
      });

      if (result.cancelled) {
        process.exit(0);
      }

      process.exit(result.success ? 0 : 1);
    } catch (error) {
      try {
        await prompts.log.error(`Installation failed: ${error.message}`);
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
