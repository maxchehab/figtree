import { expect, test } from '@oclif/test';

describe('whoami', () => {
  describe('with successful API response', () => {
    test
      .nock('https://figtree.sh', api =>
        api.get('/whoami').reply(200, { user: { email: 'jeff@example.com' } }),
      )
      .stdout()
      .command(['whoami'])
      .it('shows user email when logged in', ctx => {
        expect(ctx.stdout).to.equal('> jeff@example.com\n');
      });
  });

  describe('with un-successful API response', () => {
    test
      .nock('https://figtree.sh', api => api.get('/whoami').reply(401))
      .stdout()
      .command(['whoami'])
      .it('shows not found message with error code', ctx => {
        expect(ctx.stdout).to.equal(
          `> You aren't logged in. Try figtree login\n> EEXIT: 1\n`,
        );
      });
  });
});
