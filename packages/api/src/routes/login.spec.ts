import axios from 'axios';
import http from 'http';
import listen from 'test-listen';

import { FaunaClient } from '../fauna/fauna-client';
import closeServer from '../test/close-server';
import createTestLambda from '../test/create-test-lambda';
import login from './login';

describe('login', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createTestLambda(login);
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
    describe('with an existing login request from fauna', () => {
      beforeEach(() => {
        jest
          .spyOn(FaunaClient.prototype, 'loginRequestByCode')
          .mockImplementationOnce(async (code: string) => ({
            ref: '@ref:123',
            data: { code, createdAt: new Date().toISOString() },
          }));
      });

      it('returns 400, Expired code.', async () => {
        const { status, data } = await axios.get(url, {
          validateStatus: () => true,
          params: { code: '123' },
        });

        expect(status).toEqual(400);
        expect(data).toEqual({
          message: 'Expired code.',
        });
      });
    });

    describe('without an existing login request from fauna', () => {
      beforeEach(() => {
        jest
          .spyOn(FaunaClient.prototype, 'loginRequestByCode')
          .mockImplementationOnce(async () => null);

        jest
          .spyOn(FaunaClient.prototype, 'createLoginRequest')
          .mockImplementationOnce(async (code, createdAt) => ({
            ref: '@ref:123',
            data: { code, createdAt: createdAt.toISOString() },
          }));
      });

      it('returns 302, with Google login as the location header', async () => {
        const { status, headers } = await axios.get(url, {
          validateStatus: () => true,
          params: { code: '123' },
          maxRedirects: 0,
        });

        expect(status).toEqual(302);
        expect(headers.location).toMatch(
          /^https:\/\/accounts.google.com\/o\/oauth2\/v2\/auth/,
        );
      });
    });
  });
});
