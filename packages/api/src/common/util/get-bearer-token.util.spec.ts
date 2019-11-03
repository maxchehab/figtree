import { NextApiRequest } from 'next';

import { HttpException } from '../exceptions/http.exception';
import getBearerToken from './get-bearer-token.util';

describe('getBearerToken', () => {
  describe('with no authorization header', () => {
    const req = {
      headers: {},
    } as NextApiRequest;

    it('throws a 400 HttpException', () => {
      expect(() => getBearerToken(req)).toThrowError(
        new HttpException(400, 'Invalid bearer token.'),
      );
    });
  });

  describe('with an non string authorization header', () => {
    const req = {
      headers: { authorization: (['an', 'array'] as unknown) as string },
    } as NextApiRequest;

    it('throws a 400 HttpException', () => {
      expect(() => getBearerToken(req)).toThrowError(
        new HttpException(400, 'Invalid bearer token.'),
      );
    });
  });

  describe('with an authorization header that is has 1 word', () => {
    const req = {
      headers: { authorization: 'Bearer' },
    } as NextApiRequest;

    it('throws a 400 HttpException', () => {
      expect(() => getBearerToken(req)).toThrowError(
        new HttpException(400, 'Invalid bearer token.'),
      );
    });
  });

  describe('with an authorization header that is has 3 words', () => {
    const req = {
      headers: { authorization: 'Bearer word word' },
    } as NextApiRequest;

    it('throws a 400 HttpException', () => {
      expect(() => getBearerToken(req)).toThrowError(
        new HttpException(400, 'Invalid bearer token.'),
      );
    });
  });

  describe('with an authorization header that does not start with "Bearer"', () => {
    const req = {
      headers: { authorization: 'not a bearer token' },
    } as NextApiRequest;

    it('throws a 400 HttpException', () => {
      expect(() => getBearerToken(req)).toThrowError(
        new HttpException(400, 'Invalid bearer token.'),
      );
    });
  });

  describe('with a valid authorization header', () => {
    const req = {
      headers: { authorization: 'Bearer token_123' },
    } as NextApiRequest;

    it('returns the token with no errors', () => {
      expect(getBearerToken(req)).toEqual('token_123');
    });
  });
});
