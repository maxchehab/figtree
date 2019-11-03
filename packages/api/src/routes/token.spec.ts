import axios from 'axios';
import http from 'http';
import listen from 'test-listen';

import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { FaunaClient } from '../fauna/fauna-client';
import closeServer from '../test/close-server';
import createTestLambda from '../test/create-test-lambda';
import token from './token';

describe('token', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createTestLambda(token);
    url = await listen(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('with invalid code', () => {
    describe('with code as an array', () => {
      it('returns 400, Invalid Code', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
          params: { code: ['code', 'another code'] },
        });

        expect(status).toEqual(400);
        expect(data).toEqual({
          message: 'Invalid code.',
        });
      });
    });

    describe('with no code', () => {
      it('returns 400, Invalid Code', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
        });

        expect(status).toEqual(400);
        expect(data).toEqual({
          message: 'Invalid code.',
        });
      });
    });
  });

  describe('with valid code', () => {
    describe('with a matching code from fauna', () => {
      describe('when the auth status equals Logging In', () => {
        beforeEach(() => {
          jest
            .spyOn(FaunaClient.prototype, 'userByLoginRequestCode')
            .mockImplementationOnce(async () => ({
              ref: '@ref:123',
              data: {
                email: 'example@gmail.com',
                auth_status: AuthStatus.LoggingIn,
                id: 'usr_123',
                login_request_code: 'code_123',
                token: null,
              },
            }));

          jest
            .spyOn(FaunaClient.prototype, 'updateUser')
            .mockImplementationOnce(async () => undefined);
        });

        it('returns 200, with generated token', async () => {
          const { status, data } = await axios.get(url, {
            validateStatus: () => true,
            params: { code: 'code_123' },
          });

          expect(status).toEqual(200);
          expect(data).toEqual({
            token: expect.any(String),
          });
        });
      });

      describe('when the auth status dos not equal Logging In', () => {
        beforeEach(() => {
          jest
            .spyOn(FaunaClient.prototype, 'userByLoginRequestCode')
            .mockImplementationOnce(async () => ({
              ref: '@ref:123',
              data: {
                email: 'example@gmail.com',
                auth_status: AuthStatus.LoggedOut,
                id: 'usr_123',
                login_request_code: 'code_123',
                token: null,
              },
            }));
        });

        it('returns 400, Invalid Code', async () => {
          const { status, data } = await axios.get(url, {
            validateStatus: () => true,
            params: { code: 'code_123' },
          });

          expect(status).toEqual(400);
          expect(data).toEqual({
            message: 'Invalid code.',
          });
        });
      });
    });

    describe('without a matching code from fauna', () => {
      beforeEach(() => {
        jest
          .spyOn(FaunaClient.prototype, 'userByLoginRequestCode')
          .mockImplementationOnce(async () => null);
      });

      it('returns 400, Invalid Code', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
          params: { code: 'code_123' },
        });

        expect(status).toEqual(400);
        expect(data).toEqual({
          message: 'Invalid code.',
        });
      });
    });
  });
});
