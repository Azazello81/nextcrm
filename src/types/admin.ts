export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  name?: string; // для совместимости
  phone?: string;
  avatar?: string;
  role: UserRole;
  comment?: string;
  inn?: string;
  companyName?: string;
  telegramId?: bigint;
  telegramUsername?: string;
  registeredAt?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
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
