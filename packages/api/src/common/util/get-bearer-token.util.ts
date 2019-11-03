import { NextApiRequest } from 'next';

import { HttpException } from '../exceptions/http.exception';

export default function getBearerToken(req: NextApiRequest): string {
  const authorization = req.headers.authorization;

  if (typeof authorization !== 'string') {
    throw new HttpException(400, 'Invalid bearer token.');
  }

  const tokens = authorization.split(' ');

  if (tokens.length != 2) {
    throw new HttpException(400, 'Invalid bearer token.');
  }

  if (tokens[0] !== 'Bearer') {
    throw new HttpException(400, 'Invalid bearer token.');
  }

  return tokens[1];
}
