export type UserRole = 'consumer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  user: User;
  access_token: string;
}

