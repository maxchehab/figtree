import Command, { flags } from '@oclif/command';
import chalk from 'chalk';

import { API } from '../api/api';
import { debug } from '../utils/debug.util';

export default abstract class Base extends Command {
  static flags = {
    debug: flags.boolean({ char: 'd' }),
    api: flags.string({ char: 'a', default: 'figtree.sh' }),
  };

  api: API = {} as API;

  async init() {
    const { flags } = this.parse(Base);

    this.api = new API({
      userAgent: this.config.userAgent,
      apiHostname: flags.api,
    });
  }

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
