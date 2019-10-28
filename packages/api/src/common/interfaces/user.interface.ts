import { ExprVal } from 'faunadb';
import { AuthStatus } from './auth-status.enum';

export interface User {
  ref: ExprVal;
  data: {
    auth_status: AuthStatus;
    id: string;
    email: string;
    login_request_code: string | null;
    token: string | null;
  };
}
