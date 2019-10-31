import { Command } from '@oclif/command';
import { IConfig } from '@oclif/config';

import { API } from './api';

export default class FigtreeCommand extends Command {
  constructor(argv: string[], config: IConfig, readonly api = new API()) {
    super(argv, config);
  }

  async run() {}

  log(message: string) {
    super.log('> '.concat(message));
  }
}
