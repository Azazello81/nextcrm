import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@lib/auth/jwt';
import { UserService } from '@services/auth/user.service';

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Токен не предоставлен' },
        { status: 401 },
      );
    }

    const payload = JWTService.verifyAccessToken(token);

    if (!payload.userId) {
      return NextResponse.json({ success: false, message: 'Неверный токен' }, { status: 401 });
    }

    const user = await UserService.getUserById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Пользователь не найден' },
        { status: 404 },
      );
    }

    // Важно: возвращаем в правильном формате
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        lastName: user.lastName,
        firstName: user.firstName,
        middleName: user.middleName,
        inn: user.inn,
        companyName: user.companyName,
        avatar: user.avatar,
        comment: user.comment,
        phone: user.phone,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        isActive: user.isActive,
        registeredAt: user.registeredAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('❌ [Auth ME API] Ошибка:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Произошла ошибка при получении данных пользователя',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Токен не предоставлен' },
        { status: 401 },
      );
    }

    const payload = JWTService.verifyAccessToken(token);

    if (!payload.userId) {
      return NextResponse.json({ success: false, message: 'Неверный токен' }, { status: 401 });
    }

    const data = await request.json();
    type UpdateProfileDto = {
      companyName?: string;
      lastName?: string;
      firstName?: string;
      middleName?: string;
      phone?: string;
    };
    const allowedFields: UpdateProfileDto = {};

    if (typeof data.companyName === 'string') {
      allowedFields.companyName = data.companyName.trim();
    }
    if (typeof data.lastName === 'string') {
      allowedFields.lastName = data.lastName.trim();
    }
    if (typeof data.firstName === 'string') {
      allowedFields.firstName = data.firstName.trim();
    }
    if (typeof data.middleName === 'string') {
      allowedFields.middleName = data.middleName.trim();
    }
    if (typeof data.phone === 'string') {
      const { normalizePhone } = await import('@/lib/validation/phone');
      const normalized = normalizePhone(data.phone);
      if (!normalized) {
        return NextResponse.json(
          { success: false, message: 'Некорректный номер телефона' },
          { status: 400 },
        );
      }
      allowedFields.phone = normalized;
    }

    // Можно расширять список разрешенных полей позже

    const updatedUser = await UserService.updateProfile(payload.userId, allowedFields);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('❌ [Auth ME API PATCH] Ошибка:', error);
    const message = error instanceof Error ? error.message : 'Произошла ошибка';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
