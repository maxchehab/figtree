import { Client, query as q } from 'faunadb';
import { google } from 'googleapis';

import { Lambda } from '../common/util/lambda.util';
import { HttpException } from '../common/exceptions/http.exception';

const faunaClient = new Client({
  secret: process.env.FAUNA_SECRET as string,
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://api.fuckenv.com/auth/google',
);

export default Lambda(async (req, res) => {
  const { code } = req.query;

  if (typeof code !== 'string') {
    throw new HttpException(400, 'Invalid code.');
  }

  try {
    await faunaClient.query(
      q.Get(q.Match(q.Index('login_requests_by_code'), code)),
    );

    return res.status(200).json({
      code,
      message: 'this code has expired',
    });
  } catch (error) {
    await faunaClient.query(
      q.Create(q.Collection('login_requests'), {
        data: { code, createdAt: new Date() },
      }),
    );

    const location = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'profile',
      state: code,
    });

    res.setHeader('location', location);
    return res.status(301).send(null);
  }
});
