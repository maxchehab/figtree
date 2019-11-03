import { ulid } from 'ulid';

import { AuthStatus } from '../common/interfaces/auth-status.enum';
import { FaunaClient } from '../fauna/fauna-client';
import { HttpException } from '../common/exceptions/http.exception';
import lambda from '../common/util/lambda.util';

const client = new FaunaClient();

export default lambda(async (req, res) => {
  const { code } = req.query;

  if (typeof code !== 'string') {
    throw new HttpException(400, 'Invalid code.');
  }

  const user = await client.userByLoginRequest(code);

  if (user) {
    const { login_request_code, auth_status } = user.data;

    if (code === login_request_code && auth_status === AuthStatus.LoggingIn) {
      const token = ulid();

      await client.updateUser(user.ref, {
        token,
        auth_status: AuthStatus.LoggedIn,
      });

      return res.status(200).json({ token });
    }
  }

  throw new HttpException(400, 'Invalid code.');
});
