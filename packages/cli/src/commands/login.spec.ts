import { expect, test } from '@oclif/test';

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
          .get('/whoami')
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

  describe('with un-successful GET /whoami response', () => {
    test
      .nock('https://figtree.sh', api =>
        api
          .get('/token')
          .query(true)
          .reply(200, { token: '123' })
          .get('/whoami')
          .reply(401),
      )
      .stdout()
      .command(['login'])
      .it('shows not found message with error code', ctx => {
        const lines = ctx.stdout.split('\n');
        expect(lines.length).to.greaterThan(2);
        expect(lines[0]).to.match(
          /^> Visit https:\/\/figtree.sh\/login\?code=([A-Z0-9]*)$/,
        );
        expect(lines[1]).to.equal('> Request failed with status code 401');
      });
  });
});
