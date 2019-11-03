import { flags } from '@oclif/command';
import chalk from 'chalk';

import Base from '../utils/base.command';

export default class WhoAmI extends Base {
  static description = 'Shows the username of the currently logged in user';

  static examples = [`$ figtree whoami`];

  static flags = {
    help: flags.help({ char: 'h', description: '' }),
    ...Base.flags,
  };

  async run() {
    const notFoundMessage = `You aren't logged in. Try `.concat(
      chalk.white('figtree login'),
    );

    const { status, data } = await this.api.get('/account');

    if (status === 200) {
      const { email } = data.user;
      this.log(email);
    } else {
      this.error(notFoundMessage);
      return this.exit(1);
    }
  }
}
