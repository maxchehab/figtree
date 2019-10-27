import { Command, flags } from '@oclif/command';
import { ulid } from 'ulid';
import chalk from 'chalk';

export default class Login extends Command {
  static description = 'Logs into your account or creates a new one';

  static examples = [`$ fuckenv login`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    const code = ulid();
    const message = `Visit `.concat(
      chalk.cyan(`https://api.fuckenv.com/login?code=${code}`),
    );

    this.log(message);
  }
}
