import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../services/auth/user.service';
import { JWTService } from '../../../../lib/auth/jwt';
import { ApiResponse } from '../../../../types/registration';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email и пароль обязательны' },
        { status: 400 },
      );
    }

    const user = await UserService.authenticate(email, password);

    // Генерация JWT токена с ролью
    const token = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Создаем ответ
    const response = NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
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
      maxAge: 15 * 60, // 15 минут
    });

    return response;
  } catch (error) {
    console.error('❌ [Login API] Ошибка:', error);

     let errorMessage: string;
    let statusCode = 401;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (
        errorMessage.includes('не найден') || 
        errorMessage.includes('not found') ||
        errorMessage.includes('User not found')
      ) {
        errorMessage = 'Неверный email или пароль';
      } else if (
        errorMessage.includes('Неверный пароль') || 
        errorMessage.includes('Invalid password')
      ) {
        errorMessage = 'Неверный email или пароль';
      } else if (
        errorMessage.includes('Некорректный метод') ||
        errorMessage.includes('Incorrect method')
      ) {
        errorMessage = 'Некорректный метод аутентификации';
        statusCode = 400;
      } else {
        errorMessage = `Ошибка входа: ${errorMessage}`;
      }
    } else {
      errorMessage = 'Произошла неизвестная ошибка при входе';
    }

    const response: ApiResponse = {
      success: false,
      message: errorMessage,
    };

    return NextResponse.json(response, { status: statusCode });
  }
}
