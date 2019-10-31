import chalk from 'chalk';

export function debug(...args: any[]) {
  const debug = process.argv.find(arg => arg === '--debug' || arg === '-d');

  if (debug) {
    const debugArgs = ['>', new Date().toISOString(), ...args].map(arg =>
      chalk.dim(arg),
    );

    console.log(...debugArgs);
  }
}
