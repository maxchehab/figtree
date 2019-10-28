import { Command, flags } from '@oclif/command';
import { ulid } from 'ulid';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import axios from 'axios';
import chalk from 'chalk';

export default class Login extends Command {
  static description = 'Logs into your account or creates a new one';

  static examples = [`$ fuckenv login`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const code = ulid();
    const visitMessage = `Visit `.concat(
      chalk.cyan(`https://api.fuckenv.com/login?code=${code}`),
    );

    this.log(visitMessage);

    let token = null;

    while (!token) {
      try {
        const { status, data } = await axios.get(
          `https://api.fuckenv.com/token?code=${code}`,
        );

        if (status === 200) {
          token = data.token;
        }
      } catch (_error) {}
    }

    const homedir = os.homedir();
    const fuckEnvDir = path.join(homedir, '.fuckenv');

    if (!fs.existsSync(fuckEnvDir)) {
      fs.mkdirSync(fuckEnvDir);
    }

    const tokenPath = path.join(fuckEnvDir, 'token.json');
    const data = JSON.stringify({ token }, null, 2);
    fs.writeFileSync(tokenPath, data);

    const {
      data: { user },
    } = await axios.get(`https://api.fuckenv.com/users?token=${token}`);

    const message = `You are logged in as `.concat(chalk.bold(user.email));

    this.log(message);
  }
}
