import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService } from '../../../../services/auth/registration.service';
import { JWTService } from '../../../../lib/auth/jwt';
import { ApiResponse, CleanupResult, SessionStats } from '../../../../types/registration';

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
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const isAdmin = await isAdminUser(authHeader);

    if (!isAdmin) {
      const response: ApiResponse = {
        success: false,
        message: 'Требуются права администратора',
      };
      return NextResponse.json(response, { status: 403 });
    }

    // Выполняем очистку
    const result: CleanupResult = await RegistrationService.cleanupOldSessions();

    const response: ApiResponse<CleanupResult> = {
      success: true,
      message: 'Очистка сессий регистрации завершена',
      data: result,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [Cleanup Sessions API] Ошибка:', error);

    let errorMessage = 'Произошла неизвестная ошибка';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    const response: ApiResponse = {
      success: false,
      message: `Ошибка очистки: ${errorMessage}`,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// GET метод для получения статистики
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    const isAdmin = await isAdminUser(authHeader);

    if (!isAdmin) {
      const response: ApiResponse = {
        success: false,
        message: 'Требуются права администратора',
      };
      return NextResponse.json(response, { status: 403 });
    }

    const stats: SessionStats = await RegistrationService.getSessionStats();

    const response: ApiResponse<SessionStats> = {
      success: true,
      message: 'Статистика сессий регистрации',
      data: stats,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ [Cleanup Stats API] Ошибка:', error);

    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

    const response: ApiResponse = {
      success: false,
      message: `Ошибка получения статистики: ${errorMessage}`,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

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
