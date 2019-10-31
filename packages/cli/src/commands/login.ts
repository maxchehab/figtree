import { flags } from '@oclif/command';
import { ulid } from 'ulid';
import open from 'open';
import chalk from 'chalk';
import FigtreeCommand from '../utils/figtree-command';

export default class Login extends FigtreeCommand {
  static description = 'Logs into your account or creates a new one';

  static examples = [`$ figtree login`];

  static flags = {
    help: flags.help({ char: 'h' }),
    debug: flags.boolean({ char: 'd' }),
  };

  async run() {
    const code = ulid();
    const loginPath = `https://figtree.sh/login?code=${code}`;
    const visitMessage = `Visit `.concat(chalk.cyan(loginPath));

    this.log(visitMessage);
    (open as any)(loginPath);

    const { data } = await this.api.poll(
      ({ status }) => status === 200,
      'GET',
      '/token',
      { params: { code } },
    );

    const { token } = data;

    this.debug(`Received token '${token}'`);
    this.api.writeToken(token);
    this.api.setToken(token);

    try {
      const { status, data } = await this.api.get('/whoami');

      if (status === 200) {
        const { email } = data.user;
        const message = `You are logged in as `.concat(chalk.bold(email));

        this.log(message);
        return;
      }
    } catch (error) {
      this.log('Login failed');
      return this.exit();
    }
  }
}
