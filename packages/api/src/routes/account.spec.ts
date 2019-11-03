import axios from 'axios';
import http from 'http';
import listen from 'test-listen';

import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { FaunaClient } from '../fauna/fauna-client';
import account from './account';
import closeServer from '../test/close-server';
import createTestLambda from '../test/create-test-lambda';

describe('account', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createTestLambda(account);
    url = await listen(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('with a user found by the token provided', () => {
    describe(`with the user's 'auth_status' as Logged In`, () => {
      beforeEach(() => {
        jest
          .spyOn(FaunaClient.prototype, 'userByToken')
          .mockImplementationOnce(async () => ({
            ref: '@ref:123',
            data: {
              email: 'example@gmail.com',
              auth_status: AuthStatus.LoggedIn,
              id: 'usr_123',
              login_request_code: 'code_123',
              token: 'token_123',
            },
          }));
      });

      it('returns 200, with the user', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
          headers: { authorization: 'Bearer token_123' },
        });

        expect(status).toEqual(200);
        expect(data).toMatchSnapshot();
      });
    });

    describe(`without the user's 'auth_status' as Logged In`, () => {
      beforeEach(() => {
        jest
          .spyOn(FaunaClient.prototype, 'userByToken')
          .mockImplementationOnce(async () => ({
            ref: '@ref:123',
            data: {
              email: 'example@gmail.com',
              auth_status: AuthStatus.LoggedOut,
              id: 'usr_123',
              login_request_code: 'code_123',
              token: 'token_123',
            },
          }));
      });

      it('returns 400, Invalid token.', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
          headers: { authorization: 'Bearer token_123' },
        });

        expect(status).toEqual(400);
        expect(data).toEqual({
          message: 'Invalid token.',
        });
      });
    });
  });

  describe('without a user found by the token provided', () => {
    beforeEach(() => {
      jest
        .spyOn(FaunaClient.prototype, 'userByToken')
        .mockImplementationOnce(async () => null);
    });

    it('returns 400, Invalid token.', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
        headers: { authorization: 'Bearer token_123' },
      });

      expect(status).toEqual(400);
      expect(data).toEqual({
        message: 'Invalid token.',
      });
    });
  });
});
