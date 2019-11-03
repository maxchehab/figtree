import { AuthStatus } from './auth-status.enum';

export interface User {
  auth_status: AuthStatus;
  id: string;
  email: string;
  login_request_code: string | null;
  token: string | null;
}
