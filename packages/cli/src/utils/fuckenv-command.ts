import { Command, flags } from '@oclif/command';
import { IConfig } from '@oclif/config';
import chalk from 'chalk';

import { API } from './api';

export default class FuckEnvCommand extends Command {
  constructor(argv: string[], config: IConfig) {
    super(argv, config);

    const { flags } = this.parse(FuckEnvCommand);

    this.doDebug = flags.debug;
    this.api = new API(this.doDebug);
  }

  static flags = {
    debug: flags.boolean({ char: 'd' }),
  };

  readonly api: API;
  readonly doDebug: boolean;

  async run() {}

  log(message: string) {
    super.log('> '.concat(message));
  }

  debug = (...args: any[]) => {
    if (this.doDebug) {
      const debugArgs = ['>', new Date().toISOString(), ...args].map(arg =>
        chalk.dim(arg),
      );
      console.log(...debugArgs);
    }
  };
}
