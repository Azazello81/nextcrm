export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  login: string;
  name?: string;
  email?: string;
  phone?: string;
  datereg: Date;
  dateactiv: Date;
  avatar?: string;
  role: UserRole;
  comment?: string;
}
