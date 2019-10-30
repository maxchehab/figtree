import { flags } from '@oclif/command';
import chalk from 'chalk';

import FuckEnvCommand from '../utils/fuckenv-command';

export default class WhoAmI extends FuckEnvCommand {
  static description = 'Shows the username of the currently logged in user';

  static examples = [`$ fuckenv whoami`];

  static flags = {
    help: flags.help({ char: 'h', description: '' }),
    debug: flags.boolean({ char: 'd' }),
  };

  async run() {
    const notFoundMessage = `I don't fuck'n know. Try `.concat(
      chalk.bold('fuckenv login'),
    );

    try {
      const { status, data } = await this.api.get('/whoami');

      if (status === 200) {
        const { email } = data.user;
        const message = `You are logged in as `.concat(chalk.bold(email));

        this.log(message);
        return;
      }
    } catch (error) {
      this.log(notFoundMessage);
      return this.exit();
    }
  }
}
