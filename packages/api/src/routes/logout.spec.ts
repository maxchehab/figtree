import axios from 'axios';
import http from 'http';
import listen from 'test-listen';

import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { FaunaClient } from '../fauna/fauna-client';
import closeServer from '../test/close-server';
import createTestLambda from '../test/create-test-lambda';
import logout from './logout';

describe('logout', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createTestLambda(logout);
    url = await listen(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('with no user associated to the token', () => {
    beforeEach(() => {
      jest
        .spyOn(FaunaClient.prototype, 'userByToken')
        .mockImplementationOnce(async () => null);
    });

    it('returns 400, Invalid token', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
        headers: { authorization: 'Bearer invalid_token' },
      });

      expect(status).toEqual(400);
      expect(data).toEqual({
        message: 'Invalid bearer token.',
      });
    });
  });

  describe('with user associated to the token', () => {
    let updateUser: any;

    beforeEach(() => {
      updateUser = jest
        .spyOn(FaunaClient.prototype, 'updateUser')
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

    it('returns 200', async () => {
      const { status } = await axios.get(url, {
        validateStatus: () => true,
        headers: { authorization: 'Bearer token_123' },
      });

      expect(status).toEqual(200);

      expect(updateUser).toBeCalledTimes(1);
      expect(updateUser.mock.calls[0][1].auth_status).toEqual(
        AuthStatus.LoggedOut,
      );
      expect(updateUser.mock.calls[0][1].token).toBeNull();
    });
  });
});
