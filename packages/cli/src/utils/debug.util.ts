import chalk from 'chalk';
import * as CLI from 'cli-flags';

export function debug(...args: any[]) {
  const { flags } = CLI.parse({
    strict: false,
    flags: { debug: CLI.flags.boolean({ char: 'd' }) },
  });

  const debug = flags.debug;

  if (debug) {
    const debugArgs = ['>', new Date().toISOString(), ...args].map(arg =>
      chalk.dim(arg),
    );

    console.log(...debugArgs);
  }
}
