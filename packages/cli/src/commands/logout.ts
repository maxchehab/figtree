import { flags } from '@oclif/command';
import chalk from 'chalk';

import Base from '../utils/base.command';

export default class Logout extends Base {
  static description = 'Logs out of your account';

  static examples = [`$ figtree logout`];

  static flags = {
    help: flags.help({ char: 'h' }),
    ...Base.flags,
  };

  async run() {
    const { status } = await this.api.get('/logout');

    if (status === 200) {
      this.api.setToken(undefined);
      this.api.writeToken(undefined);
      this.log('You have been logged out');
    } else {
      this.error(
        'An error occurred and we could not log you out. For more information try running this command again with the '.concat(
          chalk.white('--debug').concat(' flag'),
        ),
      );

      this.exit(1);
    }
  }
}
