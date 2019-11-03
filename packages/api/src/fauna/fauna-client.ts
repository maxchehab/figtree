import { Client, query as q, ExprVal } from 'faunadb';

import { FaunaEntity } from './interfaces/fauna-entity.interface';
import { LoginRequest } from '../common/interfaces/login-request.interface';
import { User } from '../common/interfaces/user.interface';

export class FaunaClient {
  private readonly client = new Client({
    secret: process.env.FAUNA_SECRET as string,
  });

  async userByLoginRequest(code: string): Promise<FaunaEntity<User> | null> {
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

  async userByToken(token: string): Promise<FaunaEntity<User> | null> {
    try {
      return this.client.query(
        q.Get(q.Match(q.Index('users_by_token'), token)),
      );
    } finally {
      return null;
    }
  }

  async createLoginRequest(
    code: string,
    createdAt: Date,
  ): Promise<FaunaEntity<LoginRequest>> {
    return this.client.query(
      q.Create(q.Collection('login_requests'), {
        data: { code, createdAt: createdAt.toISOString() },
      }),
    );
  }

  async loginRequestByCode(
    code: string,
  ): Promise<FaunaEntity<LoginRequest> | null> {
    try {
      return this.client.query(
        q.Get(q.Match(q.Index('login_requests_by_code'), code)),
      );
    } finally {
      return null;
    }
  }
}
