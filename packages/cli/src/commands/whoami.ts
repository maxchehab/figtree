import { Command, flags } from '@oclif/command';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import axios from 'axios';
import chalk from 'chalk';

export default class WhoAmI extends Command {
  static description = 'Shows the username of the currently logged in user';

  static examples = [`$ fuckenv whoami`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const notFoundMessage = `I don't fuck'n know. Try `.concat(
      chalk.bold('fuckenv login'),
    );
    const homedir = os.homedir();
    const tokenPath = path.join(homedir, '.fuckenv', 'token.json');

    if (!fs.existsSync(tokenPath)) {
      this.log(notFoundMessage);
      return this.exit();
    }

    try {
      const data = fs.readFileSync(tokenPath, 'utf8');
      const { token } = JSON.parse(data);

      if (token) {
        const { status, data } = await axios.get(
          `https://api.fuckenv.com/users?token=${token}`,
        );

        if (status === 200) {
          const { email } = data.user;
          const message = `You are `.concat(chalk.bold(email));

          this.log(message);
          return;
        }
      }
    } catch (_error) {
      this.log(notFoundMessage);
      return this.exit();
    }
  }
}
