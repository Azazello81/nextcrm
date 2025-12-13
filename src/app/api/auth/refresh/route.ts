// src/app/api/auth/refresh/route.ts - Обновление access token через refresh token
import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@lib/auth/jwt';
import { UserService } from '@services/auth/user.service';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token не предоставлен' },
        { status: 400 },
      );
    }

    // Валидируем refresh token
    let payload;
    try {
      payload = JWTService.verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Невалидный или истекший refresh token' },
        { status: 401 },
      );
    }

    // Проверяем, существует ли пользователь
    const user = await UserService.getUserById(payload.userId);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден или неактивен' },
        { status: 404 },
      );
    }

    // Генерируем новый access token
    const newAccessToken = JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Генерируем новый refresh token (опционально, для ротации)
    const newRefreshToken = JWTService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Обновляем lastLoginAt
    await UserService.updateLastLogin(user.id);

    const response = NextResponse.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });

    // Устанавливаем новый токен в cookie
    response.cookies.set('auth_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 минут
    });

    return response;
  } catch (error) {
    console.error('❌ [Refresh Token API] Ошибка:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Произошла ошибка при обновлении токена',
      },
      { status: 500 },
    );
  }
}

