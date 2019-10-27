import { Command, flags } from '@oclif/command';
import chalk from 'chalk';

export default class WhoAmI extends Command {
  static description = 'Shows the username of the currently logged in user';

  static examples = [`$ fuckenv whoami`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const message = `I don't fuck'n know. Try `.concat(
      chalk.bold('fuckenv login'),
    );

    this.log(message);
  }
}
