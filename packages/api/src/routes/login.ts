import { google } from 'googleapis';

import { FaunaClient } from '../fauna/fauna-client';
import { HttpException } from '../common/exceptions/http.exception';
import lambda from '../common/util/lambda.util';

const faunaClient = new FaunaClient();

const redirectURI =
  process.env.NODE_ENV === 'production'
    ? 'https://figtree.sh/auth/google'
    : 'http://localhost:3000/auth/google';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectURI,
);

export default lambda(async (req, res) => {
  const { code } = req.query;

  if (typeof code !== 'string') {
    throw new HttpException(400, 'Invalid code.');
  }

  const request = await faunaClient.loginRequestByCode(code);

  if (request) {
    throw new HttpException(400, 'Expired code.');
  }

  await faunaClient.createLoginRequest(code, new Date());

  const location = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    state: code,
  });

  res.setHeader('location', location);
  return res.status(302).send(null);
});
