import axios from 'axios';
import http from 'http';
import listen from 'test-listen';

import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { FaunaClient } from '../fauna/fauna-client';
import closeServer from '../test/close-server';
import createTestLambda from '../test/create-test-lambda';
import projects from './projects';

describe('projects', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createTestLambda(projects);
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

    it('returns 400, Invalid bearer token', async () => {
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

  describe('with two projects associated with the user', () => {
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

      jest
        .spyOn(FaunaClient.prototype, 'projectsByUser')
        .mockImplementationOnce(async () => [
          {
            ref: '@ref:123',
            data: {
              id: 'code_123',
              name: 'token_123',
              user_id: 'usr_123',
            },
          },
          {
            ref: '@ref:123',
            data: {
              id: 'code_123',
              name: 'token_123',
              user_id: 'usr_123',
            },
          },
        ]);
    });

    it('returns two projects', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
        headers: { authorization: 'Bearer token_123' },
      });

      expect(status).toEqual(200);
      expect(data.projects.length).toEqual(2);
      expect(data.projects).toMatchSnapshot();
    });
  });

  describe('with two projects associated with the user', () => {
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

      jest
        .spyOn(FaunaClient.prototype, 'projectsByUser')
        .mockImplementationOnce(async () => []);
    });

    it('returns empty projects array', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
        headers: { authorization: 'Bearer token_123' },
      });

      expect(status).toEqual(200);
      expect(data).toEqual({ projects: [] });
    });
  });
});
