import axios from 'axios';
import http from 'http';
import listen from 'test-listen';

import { HttpException } from '../exceptions/http.exception';
import closeServer from '../../test/close-server';
import createTestLambda from '../../test/create-test-lambda';
import lambda from './lambda.util';

describe('Lambda', () => {
  describe('with route that throws HttpException', () => {
    let server: http.Server;
    let url: string;

    beforeAll(async () => {
      server = createTestLambda(
        lambda(() => {
          throw new HttpException(400, 'Error message.');
        }),
      );
      url = await listen(server);
    });

    afterAll(async () => {
      await closeServer(server);
    });

    it('returns 400, with error message', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
      });

      expect(status).toEqual(400);
      expect(data).toEqual({
        message: 'Error message.',
      });
    });
  });

  describe('with route that throws a normal error', () => {
    let server: http.Server;
    let url: string;

    beforeAll(async () => {
      server = createTestLambda(
        lambda(() => {
          throw new Error('Normal error.');
        }),
      );
      url = await listen(server);
    });

    afterAll(async () => {
      await closeServer(server);
    });

    it('returns 500, with error message', async () => {
      const { status, data } = await axios.get(url, {
        validateStatus: () => true,
      });

      expect(status).toEqual(500);
      expect(data).toEqual({
        message: 'Normal error.',
      });
    });
  });

  describe('with route that does not throw an error', () => {
    let server: http.Server;
    let url: string;

    beforeAll(async () => {
      server = createTestLambda(
        lambda(async (_req, res) => {
          res.status(200).json({ success: true });
        }),
      );
      url = await listen(server);
    });

    afterAll(async () => {
      await closeServer(server);
    });

    it('returns a 200', async () => {
      const { status, data } = await axios.get(url);

      expect(status).toEqual(200);
      expect(data).toEqual({
        success: true,
      });
    });
  });
});
