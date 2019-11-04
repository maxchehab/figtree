import { Hook } from '@oclif/config';
import chalk from 'chalk';

const hook: Hook<'command_not_found'> = async function(options) {
  const command = options.id;

  const message = chalk
    .red(`> The command `)
    .concat(chalk.white(`figtree ${command}`))
    .concat(chalk.red(` does not exist. Run `))
    .concat(chalk.white('figtree help'))
    .concat(chalk.red(' to see a list of available commands.'));

  console.log(message);
  this.exit(1);
};

export default hook;
