import { expect, test } from '@oclif/test';
import stripAnsi from 'strip-ansi';

describe('login', () => {
  beforeAll(() => {
    jest.mock('open');
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('with successful API response', () => {
    test
      .nock('https://figtree.sh', api =>
        api
          .get('/token')
          .query(true)
          .reply(200, { token: '123' })
          .get('/account')
          .reply(200, { user: { email: 'jeff@example.com' } }),
      )
      .stdout()
      .command(['login'])
      .it('shows user email when logged in', ctx => {
        const lines = ctx.stdout.split('\n');
        expect(lines.length).to.greaterThan(2);
        expect(lines[0]).to.match(
          /^> Visit https:\/\/figtree.sh\/login\?code=([A-Z0-9]*)$/,
        );
        expect(lines[1]).to.equal('> jeff@example.com');
      });
  });

  describe('with un-successful GET /account response', () => {
    test
      .nock('https://figtree.sh', api =>
        api
          .get('/token')
          .query(true)
          .reply(200, { token: '123' })
          .get('/account')
          .reply(401),
      )
      .stdout()
      .command(['login'])
      .it('shows unsuccessful message', ctx => {
        const lines = ctx.stdout.split('\n').map(line => stripAnsi(line));
        expect(lines[1]).to.equal(
          `> An error occurred and we could not login. For more information try running this command again with the --debug flag`,
        );
        expect(lines[2]).to.equal('> EEXIT: 1');
      });
  });
});
