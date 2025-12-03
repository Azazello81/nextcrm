// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService } from '../../../../services/auth/registration.service';
import { ApiResponse } from '../../../../types/registration';
import { isValidUserRole } from '../../../../lib/validation/user-roles';
import { UserRole } from '@prisma/client';

interface RegisterRequest {
  email: string;
  password: string;
  role?: UserRole | string;
}

interface RegisterResponse {
  sessionId: string;
  verificationCode?: string;
  expiresAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, role = 'USER' }: RegisterRequest = await request.json();

    if (!email || !password) {
      const response: ApiResponse = {
        success: false,
        message: 'Email и пароль обязательны',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Валидация роли (если указана)
    let finalRole: UserRole = 'USER';
    if (role) {
      if (typeof role === 'string' && !isValidUserRole(role)) {
        const response: ApiResponse = {
          success: false,
          message: 'Некорректная роль пользователя. Допустимые значения: ADMIN, MANAGER, USER',
        };
        return NextResponse.json(response, { status: 400 });
      }
      // Приводим к UserRole (TypeScript знает, что после проверки это валидный UserRole)
      finalRole = role as UserRole;
    }

    // Получаем метаданные запроса
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Создаем сессию регистрации
    const result = await RegistrationService.createRegistrationSession(
      email,
      password,
      finalRole, // Теперь это точно UserRole
      ipAddress,
      userAgent,
    );

    // Формируем ответ
    const responseData: RegisterResponse = {
      sessionId: result.sessionId,
      // В режиме разработки возвращаем код для тестирования
      ...(process.env.NODE_ENV === 'development' && {
        verificationCode: result.verificationCode,
        expiresAt: result.expiresAt,
      }),
    };

    const response: ApiResponse<RegisterResponse> = {
      success: true,
      message:
        process.env.NODE_ENV === 'development'
          ? `Код подтверждения: ${result.verificationCode} (только для разработки)`
          : 'Код подтверждения отправлен на email',
      data: responseData,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    console.error('❌ [Register API] Ошибка:', error);

    let errorMessage: string;
    let statusCode = 400;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Определяем специфические ошибки для лучшего UX
      if (errorMessage.includes('уже существует') || errorMessage.includes('already exists')) {
        errorMessage = 'Пользователь с таким email уже зарегистрирован';
        statusCode = 409; // Conflict
      } else if (
        errorMessage.includes('уже начата') ||
        errorMessage.includes('already started') ||
        errorMessage.includes('Регистрация')
      ) {
        errorMessage =
          'Регистрация для этого email уже начата. Проверьте email или запросите новый код.';
        statusCode = 429; // Too Many Requests
      } else if (
        errorMessage.includes('Некорректная роль') ||
        errorMessage.includes('Invalid role') ||
        errorMessage.includes('роль пользователя')
      ) {
        errorMessage = 'Некорректная роль пользователя. Допустимые значения: ADMIN, MANAGER, USER';
        statusCode = 400;
      } else if (
        errorMessage.includes('пароль должен') ||
        errorMessage.includes('password must') ||
        errorMessage.includes('Пароль')
      ) {
        errorMessage = 'Пароль должен содержать минимум 6 символов';
        statusCode = 400;
      } else if (
        errorMessage.includes('Превышено количество') ||
        errorMessage.includes('Too many attempts') ||
        errorMessage.includes('заблокирована')
      ) {
        errorMessage = 'Превышено количество попыток. Подождите 10 минут или запросите новый код.';
        statusCode = 429; // Too Many Requests
      } else if (
        errorMessage.includes('Срок действия') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('истек')
      ) {
        errorMessage = 'Срок действия кода истек. Запросите новый код подтверждения.';
        statusCode = 410; // Gone
      } else {
        // Общая ошибка
        errorMessage = `Ошибка регистрации: ${errorMessage}`;
      }
    } else if (typeof error === 'string') {
      errorMessage = `Ошибка регистрации: ${error}`;
    } else {
      errorMessage = 'Произошла неизвестная ошибка при регистрации. Пожалуйста, попробуйте позже.';
      statusCode = 500; // Internal Server Error
    }

    const response: ApiResponse = {
      success: false,
      message: errorMessage,
    };

    return NextResponse.json(response, { status: statusCode });
  }
}

// OPTIONS метод для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
