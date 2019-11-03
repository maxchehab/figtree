import { Client, query as q, ExprVal } from 'faunadb';
import { User } from '../common/interfaces/user.interface';
import { FaunaEntity } from './interfaces/fauna-entity.interface';

export class FaunaClient {
  private readonly client = new Client({
    secret: process.env.FAUNA_SECRET as string,
  });

  async userByLoginRequestCode(
    code: string,
  ): Promise<FaunaEntity<User> | null> {
    try {
      return this.client.query(
        q.Get(q.Match(q.Index('users_by_login_request_code'), code)),
      );
    } finally {
      return null;
    }
  }

  async updateUser(ref: ExprVal, data: Partial<User>) {
    this.client.query(q.Update(ref, { data }));
  }
}
