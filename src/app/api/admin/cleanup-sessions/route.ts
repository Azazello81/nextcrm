import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService } from '../../../../services/auth/registration.service';
import { JWTService } from '../../../../lib/auth/jwt';
import { ApiResponse, CleanupResult, SessionStats } from '../../../../types/registration';
import { withErrorHandling } from '../../../../lib/api/withErrorHandling';
import { requireAdmin } from '../../../../lib/auth/apiAuth';
import { getI18nForRequest } from '../../../../lib/i18n';

// Функция для проверки прав администратора
async function isAdminUser(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = JWTService.verifyAccessToken(token);

    // Здесь можно добавить дополнительную проверку роли из БД
    // Пока проверяем, что токен валиден
    return !!decoded.userId;
  } catch (error) {
    console.error('❌ Ошибка проверки токена:', error);
    return false;
  }
}

// POST метод для выполнения очистки
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Проверяем авторизацию через middleware/requireAdmin
  const adminCheck = requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  // Выполняем очистку
  const result: CleanupResult = await RegistrationService.cleanupOldSessions();

  const { t } = getI18nForRequest(request);

  const response: ApiResponse<CleanupResult> = {
    success: true,
    message: t('cleanup_success'),
    data: result,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
});

// GET метод для получения статистики
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Проверяем авторизацию через middleware/requireAdmin
  const adminCheck = requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const stats: SessionStats = await RegistrationService.getSessionStats();

  const response: ApiResponse<SessionStats> = {
    success: true,
    message: 'Статистика сессий регистрации',
    data: stats,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(response);
});

// OPTIONS метод для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
