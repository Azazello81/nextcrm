// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Создаем response с сообщением об успешном выходе
    const response = NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно',
    });

    // Удаляем токены из cookies
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');

    // Устанавливаем куки с истекшим сроком для полной очистки
    response.cookies.set({
      name: 'auth_token',
      value: '',
      expires: new Date(0), // Прошедшая дата
      path: '/',
    });

    response.cookies.set({
      name: 'refresh_token',
      value: '',
      expires: new Date(0),
      path: '/',
    });

    // Добавляем заголовки для очистки кэша и хранения
    response.headers.set('Clear-Site-Data', '"cookies", "storage", "cache"');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    // Логируем успешный выход (для отладки)
    console.log('✅ Logout успешно выполнен');

    return response;
  } catch (error) {
    console.error('❌ Ошибка при logout:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Произошла ошибка при выходе',
      },
      { status: 500 },
    );
  }
}

// Также добавим поддержку GET для удобства тестирования
export async function GET(request: NextRequest) {
  return POST(request);
}
