import { flags } from '@oclif/command';
import { ulid } from 'ulid';
import open from 'open';
import chalk from 'chalk';

import Base from '../utils/base.command';
import { debug } from '../utils/debug.util';

export default class Login extends Base {
  static description = 'Logs into your account or creates a new one';

  static examples = [`$ figtree login`];

  static flags = {
    help: flags.help({ char: 'h' }),
    ...Base.flags,
  };

  async run() {
    const { flags } = this.parse(Login);

    const code = ulid();
    const loginPath = `${flags.api}/login?code=${code}`;
    const visitMessage = `Visit `.concat(chalk.cyan(loginPath));

    this.log(visitMessage);
    (open as any)(loginPath);

    const {
      data: { token },
    } = await this.api.poll(({ status }) => status === 200, 'GET', '/token', {
      params: { code },
    });

    debug(`Received token '${token}'`);
    this.api.writeToken(token);
    this.api.setToken(token);

    const { status, data } = await this.api.get('/account');

    if (status === 200) {
      const { email } = data.user;
      this.log(email);
    } else {
      this.error(
        'An error occurred and we could not login. For more information try running this command again with the '.concat(
          chalk.white('--debug').concat(' flag'),
        ),
      );

      this.exit(1);
    }
  }
}
