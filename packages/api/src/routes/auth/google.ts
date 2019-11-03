import { google } from 'googleapis';

import { AuthStatus } from '../../common/interfaces/auth-status.enum';
import { FaunaClient } from '../../fauna/fauna-client';
import { HttpException } from '../../common/exceptions/http.exception';
import { User } from '../../common/interfaces/user.interface';
import lambda from '../../common/util/lambda.util';

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
  const { code, state } = req.query;

  if (typeof code !== 'string') {
    throw new HttpException(400, 'Invalid code.');
  }

  if (typeof state !== 'string') {
    throw new HttpException(400, 'Invalid state.');
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
  } as Partial<User>;

  const user = await faunaClient.userByID(id as string);

  if (user) {
    await faunaClient.updateUser(user.ref, data);
  } else {
    await faunaClient.createUser(data);
  }

  return res.status(200).json({
    message: `You are logged in as ${email}. You may close this window.`,
  });
});
