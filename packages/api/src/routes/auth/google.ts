import { Client, query as q } from 'faunadb';
import { google } from 'googleapis';

import { AuthStatus } from '../../common/interfaces/auth-status.enum';
import { HttpException } from '../../common/exceptions/http.exception';
import lambda from '../../common/util/lambda.util';

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

export default lambda(async (req, res) => {
  const { code, state } = req.query;

  if (typeof code !== 'string' || typeof state !== 'string') {
    throw new HttpException(400, 'Invalid code or state.');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const googleClient = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });

  const profile = await googleClient.userinfo.get();

  const { id, email } = profile.data;

  const data = {
    id,
    email,
    login_request_code: state,
    token: null,
    auth_status: AuthStatus.LoggingIn,
  };

  const exists = await faunaClient.query(
    q.Exists(q.Match(q.Index('users_by_id'), id as string)),
  );

  if (exists) {
    const { ref } = await faunaClient.query(
      q.Get(q.Match(q.Index('users_by_id'), id as string)),
    );

    await faunaClient.query(
      q.Update(ref, {
        data,
      }),
    );
  } else {
    await faunaClient.query(
      q.Create(q.Collection('users'), {
        data,
      }),
    );
  }

  return res.status(200).json({
    message: `You are logged in as ${email}. You may return to the shell.`,
  });
});
