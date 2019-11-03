import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { FaunaClient } from '../fauna/fauna-client';
import { HttpException } from '../common/exceptions/http.exception';
import getBearerToken from '../common/util/get-bearer-token.util';
import lambda from '../common/util/lambda.util';

const faunaClient = new FaunaClient();

export default lambda(async (req, res) => {
  const token = getBearerToken(req);
  const user = await faunaClient.userByToken(token);

  if (!user) {
    throw new HttpException(400, 'Invalid token.');
  }

  const { data } = user;

  if (data.auth_status !== AuthStatus.LoggedIn) {
    throw new HttpException(400, 'Invalid token.');
  }

  return res.status(200).json({ user: data });
});
