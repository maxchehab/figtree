import { Client, query as q } from 'faunadb';
import { ulid } from 'ulid';

import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { HttpException } from '../common/exceptions/http.exception';
import { Lambda } from '../common/util/lambda.util';
import { User } from '../common/interfaces/user.interface';

const faunaClient = new Client({
  secret: process.env.FAUNA_SECRET as string,
});

export default Lambda(async (req, res) => {
  const { code } = req.query;

  if (typeof code !== 'string') {
    throw new HttpException(400, 'Invalid code.');
  }

  const exists = await faunaClient.query(
    q.Exists(q.Match(q.Index('users_by_login_request_code'), code)),
  );

  if (exists) {
    const { data, ref } = (await faunaClient.query(
      q.Get(q.Match(q.Index('users_by_login_request_code'), code)),
    )) as User;

    const { login_request_code, auth_status } = data;

    if (code === login_request_code && auth_status === AuthStatus.LoggingIn) {
      const token = ulid();

      await faunaClient.query(
        q.Update(ref, {
          data: { token, auth_status: AuthStatus.LoggedIn },
        }),
      );

      return res.status(200).json({ token });
    }
  }

  throw new HttpException(400, 'Invalid code.');
});
