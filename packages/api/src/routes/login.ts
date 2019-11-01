import { Client, query as q } from 'faunadb';
import { google } from 'googleapis';

import { Lambda } from '../common/util/lambda.util';
import { HttpException } from '../common/exceptions/http.exception';

const faunaClient = new Client({
  secret: process.env.FAUNA_SECRET as string,
});

const redirectURI =
  process.env.NODE_ENV === 'production'
    ? 'https://figtree.sh/auth/google'
    : 'http://localhost:3000/auth/google';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectURI,
);

export default Lambda(async (req, res) => {
  const { code } = req.query;

  if (typeof code !== 'string') {
    throw new HttpException(400, 'Invalid code.');
  }

  const expired = await faunaClient.query(
    q.Exists(q.Match(q.Index('login_requests_by_code'), code)),
  );

  if (expired) {
    throw new HttpException(400, 'The code has expired.');
  }

  await faunaClient.query(
    q.Create(q.Collection('login_requests'), {
      data: { code, createdAt: new Date() },
    }),
  );

  const location = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    state: code,
  });

  res.setHeader('location', location);
  return res.status(301).send(null);
});
