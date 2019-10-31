import Command, { flags } from '@oclif/command';
import chalk from 'chalk';

import { API } from '../utils/api';
import { debug } from '../utils/debug.util';

export default abstract class Base extends Command {
  static flags = {
    debug: flags.boolean({ char: 'd' }),
  };

  readonly api: API = new API(this.config.userAgent);

  async init() {}

  async catch(error: Error) {
    this.error(error);
  }

  log(message: string) {
    super.log('> '.concat(message));
  }

  exit = (code: number = 0) => {
    debug(`Exiting with code ${code}`);
    return process.exit(code);
  };

  error = (
    input: string | Error,
    options?: {
      code?: string;
      exit?: number | false;
    },
  ) => {
    let message = '> ';

    if (typeof input === 'string') {
      message = message.concat(input);
    } else {
      message = message.concat(input.message);
    }

    super.log(chalk.red(message));

    if (options) {
      if (typeof options.exit !== 'boolean') {
        return this.exit(options.exit);
      }
    }

    return null as never;
  };
}
