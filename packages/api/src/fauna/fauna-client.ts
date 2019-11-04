import { Client, query as q, ExprVal } from 'faunadb';

import { FaunaEntity } from './interfaces/fauna-entity.interface';
import { LoginRequest } from '../common/interfaces/login-request.interface';
import { Project } from '../common/interfaces/project.interface';
import { User } from '../common/interfaces/user.interface';

export class FaunaClient {
  private readonly client = new Client({
    secret: process.env.FAUNA_SECRET as string,
  });

  async userByLoginRequest(code: string): Promise<FaunaEntity<User> | null> {
    try {
      return await this.client.query(
        q.Get(q.Match(q.Index('users_by_login_request_code'), code)),
      );
    } catch (_error) {
      return null;
    }
  }

  async updateUser(ref: ExprVal, data: Partial<User>) {
    return this.client.query(q.Update(ref, { data }));
  }

  async userByToken(token: string): Promise<FaunaEntity<User> | null> {
    try {
      return await this.client.query(
        q.Get(q.Match(q.Index('users_by_token'), token)),
      );
    } catch (_error) {
      return null;
    }
  }

  async userByID(id: string): Promise<FaunaEntity<User> | null> {
    try {
      return await this.client.query(
        q.Get(q.Match(q.Index('users_by_id'), id)),
      );
    } catch (_error) {
      return null;
    }
  }

  async projectsByUser(
    user: FaunaEntity<User>,
  ): Promise<Array<FaunaEntity<Project>>> {
    return this.client.query(
      q.Map(
        q.Paginate(q.Match(q.Index('projects_by_user_id'), user.data.id)),
        q.Lambda('X', q.Get(q.Var('X'))),
      ),
    );
  }

  async createUser(data: Partial<User>): Promise<FaunaEntity<User>> {
    return this.client.query(
      q.Create(q.Collection('users'), {
        data,
      }),
    );
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
      return await this.client.query(
        q.Get(q.Match(q.Index('login_requests_by_code'), code)),
      );
    } catch (_error) {
      return null;
    }
  }
}
