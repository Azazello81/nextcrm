// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService } from '../../../../services/auth/registration.service';
import { JWTService } from '../../../../lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, code } = await request.json();

    if (!sessionId || !code) {
      return NextResponse.json(
        { success: false, message: 'ID сессии и код обязательны' },
        { status: 400 },
      );
    }

    const user = await RegistrationService.verifyAndCreateUser(sessionId, code);

    // Генерация JWT токена
    const token = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Регистрация завершена успешно!',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    });

    // Устанавливаем HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    // Преобразуем неизвестную ошибку в строку сообщения
    const rawMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'Произошла неизвестная ошибка';

    console.error('❌ [Verify API] Ошибка:', error);

    let errorMessage: string;
    let statusCode = 400;

    if (rawMessage.includes('Неверный код')) {
      errorMessage = 'Неверный код подтверждения';
    } else if (rawMessage.includes('истек')) {
      errorMessage = 'Срок действия кода истек. Запросите новый код.';
      statusCode = 410;
    } else if (rawMessage.includes('Превышено количество')) {
      errorMessage = 'Превышено количество попыток. Сессия заблокирована.';
      statusCode = 429;
    } else if (rawMessage.includes('уже создан')) {
      errorMessage = 'Пользователь уже создан';
      statusCode = 409;
    } else if (rawMessage.includes('не найдена')) {
      errorMessage = 'Сессия регистрации не найдена или устарела';
      statusCode = 404;
    } else {
      errorMessage = rawMessage;
    }

    return NextResponse.json({ success: false, message: errorMessage }, { status: statusCode });
  }
}
