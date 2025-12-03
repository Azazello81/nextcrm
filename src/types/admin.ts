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

export interface Stats {
  totalUsers: number;
  activeToday: number;
  newThisMonth: number;
  adminUsers: number;
}

export interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  date: Date;
}

export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'error';
}
