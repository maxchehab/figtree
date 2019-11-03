import { Client, query as q } from 'faunadb';

import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { FaunaEntity } from '../fauna/interfaces/fauna-entity.interface';
import { HttpException } from '../common/exceptions/http.exception';
import { Lambda } from '../common/util/lambda.util';
import { User } from '../common/interfaces/user.interface';

const faunaClient = new Client({
  secret: process.env.FAUNA_SECRET as string,
});

export default Lambda(async (req, res) => {
  const authorization = req.headers.authorization;

  if (typeof authorization !== 'string') {
    throw new HttpException(400, 'Invalid token.');
  }

  const token = authorization.split(' ')[1];

  const exists = await faunaClient.query(
    q.Exists(q.Match(q.Index('users_by_token'), token)),
  );

  if (exists) {
    const { data } = (await faunaClient.query(
      q.Get(q.Match(q.Index('users_by_token'), token)),
    )) as FaunaEntity<User>;

    if (data.auth_status === AuthStatus.LoggedIn) {
      return res.status(200).json({ user: data });
    }
  }

  throw new HttpException(400, 'Invalid token.');
});
