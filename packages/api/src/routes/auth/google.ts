import { google } from 'googleapis';

import { Lambda } from '../../common/util/lambda.util';
import { HttpException } from '../../common/exceptions/http.exception';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://api.fuckenv.com/auth/google',
);

export default Lambda(async (req, res) => {
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

  return res.status(200).json(profile);
});
