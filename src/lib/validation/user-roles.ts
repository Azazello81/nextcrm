import { UserRole } from '@prisma/client';

// Валидация и преобразование строки в UserRole
export function validateUserRole(role: string): UserRole {
  const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'USER'];

  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }

  // По умолчанию возвращаем USER
  return 'USER';
}

// Проверка, является ли строка валидной ролью
export function isValidUserRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ['ADMIN', 'MANAGER', 'USER'];
  return validRoles.includes(role as UserRole);
}
