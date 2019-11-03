import { expect, test } from '@oclif/test';
import stripAnsi from 'strip-ansi';

describe('login', () => {
  describe('with successful API response', () => {
    test
      .nock('https://figtree.sh', api => api.get('/logout').reply(200))
      .stdout()
      .command(['logout'])
      .it('prints success message', ctx => {
        expect(ctx.stdout).to.equal('> You have been logged out\n');
      });
  });

  describe('with un-successful GET /account response', () => {
    test
      .nock('https://figtree.sh', api => api.get('/logout').reply(401))
      .stdout()
      .command(['logout'])
      .it('shows not found message with error code', ctx => {
        const message = stripAnsi(ctx.stdout);
        expect(message).to.equal(
          `> An error occurred and we could not log you out. For more information try running this command again with the --debug flag\n> EEXIT: 1\n`,
        );
      });
  });
});
