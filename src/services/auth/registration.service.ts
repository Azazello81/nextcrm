import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordService } from '../../lib/auth/password';
import { validateUserRole } from '../../lib/validation/user-roles';
import {
  CleanupResult,
  SessionStats,
  RegistrationSessionData,
  RegistrationSessionDetails,
} from '../../types/registration';

const prisma = new PrismaClient();

export class RegistrationService {
  // Генерация 6-значного кода подтверждения
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Создание сессии регистрации
  static async createRegistrationSession(
    email: string,
    password: string,
    role: UserRole = 'USER',
    ipAddress?: string,
    userAgent?: string,
  ) {
    // Валидируем и преобразуем роль
    const validatedRole = validateUserRole(role);
    console.log('🔸 [RegistrationService] Создание сессии для:', email, 'роль:', validatedRole);

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Проверка существующей активной сессии
    const existingSession = await prisma.registrationSession.findUnique({
      where: { email },
    });

    if (existingSession && !this.isSessionExpired(existingSession.verificationCodeExpires)) {
      // Если сессия активна, обновляем код
      return await this.resendVerificationCode(email);
    }

    // Проверка пароля
    if (!PasswordService.validatePasswordStrength(password)) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }

    // Валидация роли
    if (!['ADMIN', 'MANAGER', 'USER'].includes(role)) {
      throw new Error('Некорректная роль пользователя');
    }

    // Хеширование пароля
    const passwordHash = await PasswordService.hashPassword(password);

    // Генерация кода подтверждения
    const verificationCode = this.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Создание или обновление сессии
    const session = await prisma.registrationSession.upsert({
      where: { email },
      update: {
        passwordHash,
        role: validatedRole,
        verificationCode,
        verificationCodeExpires,
        attempts: 0,
        isVerified: false,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        updatedAt: new Date(),
      },
      create: {
        email,
        passwordHash,
        role: validatedRole,
        verificationCode,
        verificationCodeExpires,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    console.log('✅ [RegistrationService] Сессия создана, ID:', session.id);
    console.log('📧 Код подтверждения:', verificationCode);

    return {
      sessionId: session.id,
      verificationCode,
      expiresAt: session.verificationCodeExpires,
    };
  }

  // Проверка кода подтверждения и создание пользователя
  static async verifyAndCreateUser(sessionId: string, code: string) {
    console.log('🔸 [RegistrationService] Подтверждение сессии:', sessionId);

    const session = await prisma.registrationSession.findUnique({
      where: { id: sessionId },
      include: {
        user: true, // Теперь связь работает
      },
    });

    if (!session) {
      throw new Error('Сессия регистрации не найдена');
    }

    // Проверяем, создан ли уже пользователь для этой сессии
    if (session.userId) {
      // Если есть userId, значит пользователь уже создан
      const existingUser = await prisma.user.findUnique({
        where: { id: session.userId },
      });

      if (existingUser) {
        throw new Error('Пользователь уже создан');
      }
    }

    if (session.isVerified) {
      throw new Error('Сессия уже подтверждена');
    }

    // Проверка срока действия кода
    if (this.isSessionExpired(session.verificationCodeExpires)) {
      throw new Error('Срок действия кода истек');
    }

    // Проверка кода
    if (session.verificationCode !== code) {
      // Увеличиваем счетчик попыток
      await prisma.registrationSession.update({
        where: { id: sessionId },
        data: {
          attempts: { increment: 1 },
          updatedAt: new Date(),
        },
      });

      if (session.attempts + 1 >= 3) {
        await this.markSessionAsBlocked(sessionId);
        throw new Error('Превышено количество попыток. Сессия заблокирована.');
      }

      throw new Error('Неверный код подтверждения');
    }

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email: session.email,
        passwordHash: session.passwordHash,
        role: session.role,
        registeredAt: new Date(),
      },
    });

    console.log('✅ [RegistrationService] Пользователь создан:', user.email, 'Роль:', user.role);

    // Обновляем сессию - связываем с пользователем и помечаем как подтвержденную
    await prisma.registrationSession.update({
      where: { id: sessionId },
      data: {
        userId: user.id,
        isVerified: true,
        updatedAt: new Date(),
      },
    });

    // Удаляем дубликаты сессий для этого email
    await this.cleanupDuplicateSessions(session.email, sessionId);

    // УДАЛЯЕМ сессию после успешного создания пользователя (опционально)
    // ИЛИ оставляем для истории (рекомендуется оставить)
    console.log('✅ [RegistrationService] Сессия подтверждена и связана с пользователем:', user.id);

    return user;
  }

  // Повторная отправка кода
  static async resendVerificationCode(email: string) {
    console.log('🔸 [RegistrationService] Повторная отправка кода для:', email);

    const session = await prisma.registrationSession.findUnique({
      where: { email },
    });

    if (!session) {
      throw new Error('Сессия регистрации не найдена');
    }

    if (session.isVerified) {
      throw new Error('Сессия уже подтверждена');
    }

    // Генерация нового кода
    const verificationCode = this.generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Обновление сессии
    const updatedSession = await prisma.registrationSession.update({
      where: { id: session.id },
      data: {
        verificationCode,
        verificationCodeExpires,
        attempts: 0,
        updatedAt: new Date(),
      },
    });

    console.log('✅ [RegistrationService] Новый код отправлен для:', email);
    console.log('📧 Новый код:', verificationCode);

    return {
      sessionId: updatedSession.id,
      verificationCode,
      expiresAt: updatedSession.verificationCodeExpires,
    };
  }

 // Полная очистка старых сессий
  static async cleanupOldSessions(): Promise<CleanupResult> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    try {
      console.log('🧹 [RegistrationService] Начало очистки старых сессий...');

      // 1. Удаляем ПОДТВЕРЖДЕННЫЕ сессии старше 1 дня
      const deletedSuccessful = await prisma.registrationSession.deleteMany({
        where: {
          isVerified: true,
          updatedAt: { lt: oneDayAgo },
        },
      });

      // 2. Удаляем ИСТЕКШИЕ сессии (код просрочен, не подтверждены)
      const deletedExpired = await prisma.registrationSession.deleteMany({
        where: {
          verificationCodeExpires: { lt: now },
          isVerified: false,
          userId: null, // Только те, где пользователь не создан
        },
      });

      // 3. Удаляем ВСЕ сессии старше 1 недели (страховочная очистка)
      const deletedOld = await prisma.registrationSession.deleteMany({
        where: {
          createdAt: { lt: oneWeekAgo },
          userId: null, // Только те, где пользователь не создан
        },
      });

      // 4. Дополнительно: удаляем сессии с userId но без пользователя (ошибки в данных)
      const deletedOrphaned = await prisma.registrationSession.deleteMany({
        where: {
          userId: { not: null },
          user: null, // Связь есть, но пользователь удален
        },
      });

      console.log(`✅ [RegistrationService] Очистка завершена:
        Удалено подтвержденных сессий (>1 дня): ${deletedSuccessful.count}
        Удалено истекших сессий: ${deletedExpired.count}
        Удалено старых сессий (>1 недели): ${deletedOld.count}
        Удалено orphaned сессий: ${deletedOrphaned.count}`);

      return {
        deletedSuccessful: deletedSuccessful.count,
        deletedExpired: deletedExpired.count,
        deletedOld: deletedOld.count,
        deletedOrphaned: deletedOrphaned.count,
      };
    } catch (error) {
      console.error('❌ [RegistrationService] Ошибка очистки сессий:', error);
      throw error;
    }
  }

  // Получение статистики перед очисткой (для логов)
  static async getCleanupStats() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      successfulToDelete,
      expiredToDelete,
      oldToDelete,
      orphanedToDelete,
      totalSessions
    ] = await Promise.all([
      // Подтвержденные старше 1 дня
      prisma.registrationSession.count({
        where: {
          isVerified: true,
          updatedAt: { lt: oneDayAgo },
        },
      }),
      // Истекшие сессии
      prisma.registrationSession.count({
        where: {
          verificationCodeExpires: { lt: now },
          isVerified: false,
          userId: null,
        },
      }),
      // Все старше 1 недели
      prisma.registrationSession.count({
        where: {
          createdAt: { lt: oneWeekAgo },
          userId: null,
        },
      }),
      // Orphaned сессии
      prisma.registrationSession.count({
        where: {
          userId: { not: null },
          user: null,
        },
      }),
      // Всего сессий
      prisma.registrationSession.count(),
    ]);

    return {
      successfulToDelete,
      expiredToDelete,
      oldToDelete,
      orphanedToDelete,
      totalSessions,
      timestamp: new Date().toISOString(),
    };
  }


  // Принудительная очистка всех сессий (только для админов в экстренных случаях)
  static async cleanupAllSessions(): Promise<{ deletedCount: number }> {
    try {
      console.log('⚠️ [RegistrationService] ПРИНУДИТЕЛЬНАЯ очистка ВСЕХ сессий...');
      
      const result = await prisma.registrationSession.deleteMany({});
      
      console.log(`⚠️ [RegistrationService] Удалено ВСЕХ сессий: ${result.count}`);
      
      return { deletedCount: result.count };
    } catch (error) {
      console.error('❌ [RegistrationService] Ошибка принудительной очистки:', error);
      throw error;
    }
  }



  // Получение информации о сессии
  static async getSession(sessionId: string): Promise<RegistrationSessionData | null> {
    const session = await prisma.registrationSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        email: true,
        attempts: true,
        isVerified: true,
        verificationCodeExpires: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    return session;
  }

  // Получение статистики по сессиям
  static async getSessionStats(): Promise<SessionStats> {
    const totalSessions = await prisma.registrationSession.count();
    const verifiedSessions = await prisma.registrationSession.count({
      where: { isVerified: true },
    });
    const blockedSessions = await prisma.registrationSession.count({
      where: { attempts: { gte: 3 } },
    });
    const expiredSessions = await prisma.registrationSession.count({
      where: {
        verificationCodeExpires: { lt: new Date() },
        isVerified: false,
        userId: null,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionsToday = await prisma.registrationSession.count({
      where: {
        createdAt: { gte: today },
      },
    });

    return {
      totalSessions,
      verifiedSessions,
      blockedSessions,
      expiredSessions,
      sessionsToday,
    };
  }

  // Получение детальной информации о сессии
  static async getSessionDetails(sessionId: string): Promise<RegistrationSessionDetails> {
    const session = await prisma.registrationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Сессия не найдена');
    }

    let user = null;
    if (session.userId) {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          role: true,
          registeredAt: true,
          lastLoginAt: true,
        },
      });
    }

    return {
      id: session.id,
      email: session.email,
      attempts: session.attempts,
      isVerified: session.isVerified,
      verificationCodeExpires: session.verificationCodeExpires,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      userId: session.userId,
      user,
    };
  }

  // Проверка доступности email для регистрации
  static async checkEmailAvailability(email: string): Promise<{
    available: boolean;
    reason?: string;
  }> {
    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        available: false,
        reason: 'Пользователь с таким email уже существует',
      };
    }

    // Проверка активной сессии
    const existingSession = await prisma.registrationSession.findUnique({
      where: { email },
    });

    if (existingSession && !this.isSessionExpired(existingSession.verificationCodeExpires)) {
      return {
        available: false,
        reason: 'Регистрация для этого email уже начата',
      };
    }

    return {
      available: true,
    };
  }

  // Приватные методы

  private static isSessionExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  private static async markSessionAsBlocked(sessionId: string) {
    await prisma.registrationSession.update({
      where: { id: sessionId },
      data: {
        attempts: 999,
        updatedAt: new Date(),
      },
    });
    console.log('🔒 [RegistrationService] Сессия заблокирована:', sessionId);
  }

  private static async cleanupDuplicateSessions(email: string, currentSessionId: string) {
    await prisma.registrationSession.deleteMany({
      where: {
        email,
        id: { not: currentSessionId },
        isVerified: false,
        userId: null,
      },
    });
  }
}
