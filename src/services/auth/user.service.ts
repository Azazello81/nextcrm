// src/services/auth/user.service.ts
import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordService } from '../../lib/auth/password';
import { validateUserRole, isValidUserRole } from '../../lib/validation/user-roles';

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
      throw new Error('Пользователь не найден');
    }

    if (!user.passwordHash) {
      throw new Error('Некорректный метод аутентификации');
    }

    // Проверка пароля
    const isValid = await PasswordService.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Неверный пароль');
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
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
      throw new Error('Пользователь не найден');
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
      throw new Error('Пользователь не найден');
    }

    return user;
  }

  // Обновление роли пользователя
  static async updateUserRole(userId: string, newRole: string, adminId: string) {
    // Валидируем роль
    if (!isValidUserRole(newRole)) {
      throw new Error('Некорректная роль пользователя');
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
      throw new Error('Недостаточно прав для изменения ролей');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
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

  // Обновление профиля пользователя
  static async updateProfile(
    userId: string,
    data: {
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
        throw new Error('Пользователь с таким email уже существует');
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
    console.log('🔸 [UserService] Деактивация пользователя:', userId);

    // Проверяем права администратора
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Недостаточно прав для деактивации пользователей');
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

  // Активация пользователя
  static async activateUser(userId: string, adminId: string) {
    console.log('🔸 [UserService] Активация пользователя:', userId);

    // Проверяем права администратора
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new Error('Недостаточно прав для активации пользователей');
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
          { telegramUsername: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      select: {
        id: true,
        email: true,
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
      throw new Error('Пользователь не найден или использует другой метод аутентификации');
    }

    // Проверка текущего пароля
    const isValid = await PasswordService.verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Текущий пароль неверен');
    }

    // Проверка сложности нового пароля
    if (!PasswordService.validatePasswordStrength(newPassword)) {
      throw new Error('Новый пароль должен содержать минимум 6 символов');
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
      throw new Error('Недостаточно прав для сброса пароля');
    }

    // Проверка сложности пароля
    if (!PasswordService.validatePasswordStrength(newPassword)) {
      throw new Error('Новый пароль должен содержать минимум 6 символов');
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
}
