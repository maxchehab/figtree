import { oauth2_v2 } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import axios from 'axios';
import http from 'http';
import listen from 'test-listen';

import { AuthStatus } from '../../common/interfaces/auth-status.enum';
import { FaunaClient } from '../../fauna/fauna-client';
import closeServer from '../../test/close-server';
import createTestLambda from '../../test/create-test-lambda';
import google from './google';

describe('google', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createTestLambda(google);
    url = await listen(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('with invalid code', () => {
    it('returns 400, Invalid code.', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
      });

      expect(status).toEqual(400);
      expect(data).toEqual({
        message: 'Invalid code.',
      });
    });
  });

  describe('with invalid state', () => {
    it('returns 400, Invalid code.', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
        params: { code: 'valid code' },
      });

      expect(status).toEqual(400);
      expect(data).toEqual({
        message: 'Invalid state.',
      });
    });
  });

  describe('with valid code and state', () => {
    beforeAll(() => {
      jest
        .spyOn(OAuth2Client.prototype, 'getToken')
        .mockImplementation(async () => ({ tokens: {} }));

      jest
        .spyOn(oauth2_v2.Resource$Userinfo.prototype, 'get')
        .mockImplementation(async () => ({
          data: {
            id: 'usr_123',
            email: 'example@gmail.com',
          },
        }));
    });

    describe('with existing user', () => {
      let updateUser: any;

      beforeEach(() => {
        jest
          .spyOn(FaunaClient.prototype, 'userByID')
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

        updateUser = jest
          .spyOn(FaunaClient.prototype, 'updateUser')
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

      it('updates user and returns 200', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
          params: { code: 'code', state: 'state' },
        });

        expect(status).toEqual(200);
        expect(data).toEqual({
          message: `You are logged in as example@gmail.com. You may close this window.`,
        });

        expect(updateUser).toBeCalledTimes(1);
        expect(updateUser.mock.calls[0][1]).toMatchSnapshot();
      });
    });

    describe('with non-existing user', () => {
      let createUser: any;

      beforeEach(() => {
        jest
          .spyOn(FaunaClient.prototype, 'userByID')
          .mockImplementationOnce(async () => null);

        createUser = jest
          .spyOn(FaunaClient.prototype, 'createUser')
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

      it('creates user and returns 200', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
          params: { code: 'code', state: 'state' },
        });

        expect(status).toEqual(200);
        expect(data).toEqual({
          message: `You are logged in as example@gmail.com. You may close this window.`,
        });

        expect(createUser).toBeCalledTimes(1);
        expect(createUser.mock.calls[0][0]).toMatchSnapshot();
      });
    });
  });
});
