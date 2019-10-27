import { Command, flags } from '@oclif/command';

export default class WhoAmI extends Command {
  static description = 'Shows the username of the currently logged in user';

  static examples = [`$ fuckenv whoami`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    this.log(`I don't fuck'n know`);
  }
}
