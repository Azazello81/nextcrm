// src/services/auth/user.service.ts
import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordService } from '../../lib/auth/password';
import { validateUserRole, isValidUserRole } from '../../lib/validation/user-roles';
import { ApiError } from '../../lib/api/ApiError';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export class UserService {
  // Метод для генерации кода подтверждения (если нужно для других целей)
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Проверка подключения к БД
  static async checkConnection() {
    try {
      await prisma.$connect();
      console.log('✅ Подключение к БД установлено');

      const userCount = await prisma.user.count();
      console.log(`📊 Количество пользователей в БД: ${userCount}`);

      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к БД:', error);
      return false;
    }
  }

  // Аутентификация пользователя
  static async authenticate(email: string, password: string) {
    console.log('🔸 [UserService] Аутентификация для:', email);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError('user_not_found', 404);
    }

    if (!user.passwordHash) {
      throw new ApiError('invalid_auth_method', 400);
    }

    // Проверка пароля
    const isValid = await PasswordService.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new ApiError('invalid_password', 401);
    }

    // Обновление времени последнего входа
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    console.log('✅ [UserService] Аутентификация успешна для:', user.email, 'Роль:', user.role);

    // Возвращаем пользователя без passwordHash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Получение пользователя по ID
  static async getUserById(userId: string) {
    if (!userId) {
      throw new ApiError('missing_user_id', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
        middleName: true,
        phone: true,
        inn: true,
        companyName: true,
        avatar: true,
        comment: true,
        role: true,
        telegramId: true,
        telegramUsername: true,
        registeredAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new ApiError('user_not_found', 404);
    }

    return user;
  }

  // Получение пользователя по email
  static async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
        middleName: true,
        phone: true,
        inn: true,
        companyName: true,
        avatar: true,
        comment: true,
        role: true,
        telegramId: true,
        telegramUsername: true,
        registeredAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new ApiError('user_not_found', 404);
    }

    return user;
  }

  // Обновление роли пользователя
  static async updateUserRole(userId: string, newRole: string, adminId: string) {
    // Валидируем роль
    if (!isValidUserRole(newRole)) {
      throw new ApiError('invalid_role', 400);
    }

    const validatedRole = validateUserRole(newRole);

    console.log(
      '🔸 [UserService] Обновление роли пользователя:',
      userId,
      'на роль:',
      validatedRole,
    );
    // Проверяем, что админ существует и имеет права
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ApiError('forbidden', 403);
    }

    // Если мы пытаемся лишить пользователя роли ADMIN, убедимся, что останется хотя бы один админ
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      throw new ApiError('user_not_found', 404);
    }

    if (currentUser.role === 'ADMIN' && validatedRole !== 'ADMIN') {
      const otherAdmins = await prisma.user.count({
        where: {
          role: 'ADMIN',
          id: { not: userId },
          isActive: true,
        },
      });

      if (otherAdmins === 0) {
        throw new ApiError('cannot_demote_last_admin', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: validatedRole },
    });

    console.log(
      '✅ [UserService] Роль пользователя обновлена:',
      updatedUser.email,
      'Новая роль:',
      updatedUser.role,
    );
    return updatedUser;
  }

  // Получение списка пользователей с фильтрацией по ролям
  static async getUsers(role?: UserRole, activeOnly: boolean = true) {
    // Создаем типобезопасный where объект
    const where: {
      role?: UserRole;
      isActive?: boolean;
    } = {};

    if (role) {
      where.role = role;
    }

    if (activeOnly) {
      where.isActive = true;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
        middleName: true,
        phone: true,
        inn: true,
        companyName: true,
        avatar: true,
        comment: true,
        role: true,
        telegramId: true,
        telegramUsername: true,
        registeredAt: true,
        lastLoginAt: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  // Создание пользователя администратором
  static async createUser(data: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
  }) {
    const { email, password, firstName, lastName, middleName, phone, role, isActive } = data;

    // Проверяем, что email уникален
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError('user_exists', 409);
    }

    // Валидируем роль (если передана)
    if (role && !isValidUserRole(role)) {
      throw new ApiError('invalid_role', 400);
    }

    const passwordHash = password ? await PasswordService.hashPassword(password) : null;

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        middleName,
        phone,
        role: (role as UserRole) || 'USER',
        registeredAt: new Date(),
        isActive: isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
        middleName: true,
        phone: true,
        role: true,
        registeredAt: true,
        lastLoginAt: true,
        createdAt: true,
        isActive: true,
      },
    });

    console.log('✅ [UserService] Пользователь создан:', created.email);
    return created;
  }

  // Получение статистики по пользователям
  static async getUserStats() {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const managerCount = await prisma.user.count({ where: { role: 'MANAGER' } });
    const userCount = await prisma.user.count({ where: { role: 'USER' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await prisma.user.count({
      where: {
        registeredAt: {
          gte: today,
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      adminCount,
      managerCount,
      userCount,
      newUsersToday,
    };
  }

  // Проверка, имеет ли пользователь определенную роль
  static async hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return false;
    }

    // Админы имеют доступ ко всему
    if (user.role === 'ADMIN') {
      return true;
    }

    // Проверка конкретной роли
    return user.role === requiredRole;
  }

  // Проверка, имеет ли пользователь одну из указанных ролей
  static async hasAnyRole(userId: string, requiredRoles: UserRole[]): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return false;
    }

    // Админы имеют доступ ко всему
    if (user.role === 'ADMIN') {
      return true;
    }

    // Проверка наличия одной из ролей
    return requiredRoles.includes(user.role);
  }

  // Обновление времени последнего входа
  static async updateLastLogin(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // Обновление профиля пользователя
  static async updateProfile(
    userId: string,
    data: {
      lastName?: string;
      firstName?: string;
      middleName?: string;
      phone?: string;
      inn?: string;
      companyName?: string;
      avatar?: string;
      comment?: string;
      email?: string;
      telegramId?: bigint;
      telegramUsername?: string;
    },
  ) {
    console.log('🔸 [UserService] Обновление профиля для:', userId);

    // Если меняем email, проверяем уникальность
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ApiError('user_exists', 409);
      }
    }

    // Если меняем ИНН, проверяем уникальность
    if (data.inn) {
      const existingInn = await prisma.user.findFirst({
        where: {
          inn: data.inn,
          id: { not: userId },
        },
      });

      if (existingInn) {
        throw new ApiError('inn_exists', 409);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
        middleName: true,
        phone: true,
        inn: true,
        companyName: true,
        avatar: true,
        comment: true,
        role: true,
        telegramId: true,
        telegramUsername: true,
        registeredAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('✅ [UserService] Профиль обновлен для:', updatedUser.email);
    return updatedUser;
  }

  // Мягкое удаление пользователя (деактивация)
  static async deactivateUser(userId: string, adminId: string) {
    if (!userId) {
      throw new ApiError('invalid_user_id', 400);
    }
    if (!adminId) {
      throw new ApiError('not_admin', 401);
    }

    console.log('🔸 [UserService] Деактивация пользователя:', userId);

    // Проверяем права администратора
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ApiError('forbidden', 403);
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      throw new ApiError('user_not_found', 404);
    }

    if (targetUser.role === 'ADMIN') {
      const otherAdmins = await prisma.user.count({
        where: { role: 'ADMIN', id: { not: userId }, isActive: true },
      });
      if (otherAdmins === 0) {
        throw new ApiError('cannot_demote_last_admin', 400);
      }
    }

    const deactivatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    console.log('✅ [UserService] Пользователь деактивирован:', deactivatedUser.email);
    return deactivatedUser;
  }

  // Жёсткое удаление пользователя из базы (hard delete)
  static async hardDeleteUser(userId: string, adminId: string) {
    if (!userId) {
      throw new ApiError('invalid_user_id', 400);
    }
    if (!adminId) {
      throw new ApiError('not_admin', 401);
    }

    console.log('🔸 [UserService] Жёсткое удаление пользователя:', userId);

    // Проверяем права администратора
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'ADMIN') {
      throw new ApiError('forbidden', 403);
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      throw new ApiError('user_not_found', 404);
    }

    if (targetUser.role === 'ADMIN') {
      const otherAdmins = await prisma.user.count({
        where: { role: 'ADMIN', id: { not: userId }, isActive: true },
      });
      if (otherAdmins === 0) {
        throw new ApiError('cannot_demote_last_admin', 400);
      }
    }

    const deleted = await prisma.user.delete({ where: { id: userId } });

    console.log('✅ [UserService] Пользователь удалён навсегда:', deleted.email);
    return deleted;
  }

  // Активация пользователя
  static async activateUser(userId: string, adminId: string) {
    console.log('🔸 [UserService] Активация пользователя:', userId);

    // Проверяем права администратора
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ApiError('forbidden', 403);
    }

    const activatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
    });

    console.log('✅ [UserService] Пользователь активирован:', activatedUser.email);
    return activatedUser;
  }

  // Поиск пользователей по email или telegram username
  static async searchUsers(query: string, limit: number = 10) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { companyName: { contains: query, mode: 'insensitive' } },
          { inn: { contains: query, mode: 'insensitive' } },
          { comment: { contains: query, mode: 'insensitive' } },
          { telegramUsername: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        lastName: true,
        firstName: true,
        middleName: true,
        inn: true,
        companyName: true,
        avatar: true,
        comment: true,
        role: true,
        telegramId: true,
        telegramUsername: true,
        registeredAt: true,
        lastLoginAt: true,
      },
      take: limit,
      orderBy: { registeredAt: 'desc' },
    });

    return users;
  }

  // Смена пароля
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    console.log('🔸 [UserService] Смена пароля для:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new ApiError('user_not_found', 404);
    }

    // Проверка текущего пароля
    const isValid = await PasswordService.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ApiError('invalid_password', 401);
    }

    // Проверка сложности нового пароля
    if (!PasswordService.validatePasswordStrength(newPassword)) {
      throw new ApiError('password_too_short', 400, { min: 6 });
    }

    // Хеширование нового пароля
    const newPasswordHash = await PasswordService.hashPassword(newPassword);

    // Обновление пароля
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    console.log('✅ [UserService] Пароль изменен для:', user.email);
    return { success: true };
  }

  // Сброс пароля (для администратора)
  static async resetPassword(userId: string, adminId: string, newPassword: string) {
    console.log('🔸 [UserService] Сброс пароля для:', userId, 'админом:', adminId);

    // Проверяем права администратора
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new ApiError('forbidden', 403);
    }

    // Проверка сложности пароля
    if (!PasswordService.validatePasswordStrength(newPassword)) {
      throw new ApiError('password_too_short', 400, { min: 6 });
    }

    // Хеширование нового пароля
    const newPasswordHash = await PasswordService.hashPassword(newPassword);

    // Обновление пароля
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    console.log('✅ [UserService] Пароль сброшен для:', user.email);
    return { success: true, email: user.email };
  }

  // Получение полного имени пользователя
  static getFullName(user: {
    lastName?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    email: string;
  }): string {
    const parts: string[] = [];

    if (user.lastName && user.lastName.trim()) parts.push(user.lastName.trim());
    if (user.firstName && user.firstName.trim()) parts.push(user.firstName.trim());
    if (user.middleName && user.middleName.trim()) parts.push(user.middleName.trim());

    return parts.length > 0 ? parts.join(' ') : user.email;
  }

  // Получение инициалов
  static getInitials(user: {
    lastName?: string | null;
    firstName?: string | null;
    email: string;
  }): string {
    let initials = '';
    if (user.lastName && user.lastName.trim())
      initials += user.lastName.trim().charAt(0).toUpperCase();
    if (user.firstName && user.firstName.trim())
      initials += user.firstName.trim().charAt(0).toUpperCase();

    return initials || user.email.charAt(0).toUpperCase();
  }

  // Проверка заполненности профиля
  static isProfileComplete(user: {
    lastName?: string | null;
    firstName?: string | null;
    email: string;
  }): boolean {
    return Boolean(user.email?.trim() && user.firstName?.trim() && user.lastName?.trim());
  }
}
