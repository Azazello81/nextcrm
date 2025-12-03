// proxy.ts (обновленная версия)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTService } from '../src/lib/auth/jwt';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Логируем только в development и только важные пути
  if (process.env.NODE_ENV === 'development') {
    // Пропускаем статические файлы и служебные пути
    const shouldLog =
      !pathname.match(/\.(ico|png|jpg|jpeg|css|js)$/) && !pathname.startsWith('/_next/');

    if (shouldLog) {
      console.log('🛠️ Proxy:', {
        path: pathname,
        method: request.method,
        time: new Date().toLocaleTimeString(),
      });
    }
  }

  // 🔐 ЗАЩИЩЕННЫЕ ПУТИ - требуют аутентификации
  const protectedPaths = [
    '/user',           // Личный кабинет пользователя
    '/admin',          // Админ панель
  ];

  // Проверяем, является ли route защищенным
  const isProtectedPath = protectedPaths.some(protectedPath => 
    pathname.startsWith(protectedPath)
  );

  // Если route защищенный - проверяем аутентификацию
  if (isProtectedPath) {
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    // Для API внутри защищенных путей
    const isProtectedApi = pathname.startsWith('/api/user') || pathname.startsWith('/api/admin');

    console.log('🔐 Проверка доступа к:', pathname, 'Токен:', token ? 'есть' : 'нет');

    if (!token) {
      console.log('🚫 Доступ запрещен: отсутствует токен для защищенного пути', pathname);
      
      // Для API routes возвращаем 401
      if (isProtectedApi) {
        return NextResponse.json(
          { success: false, message: 'Требуется аутентификация' },
          { status: 401 }
        );
      }
      
      // Для страниц - редирект на логин
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Валидируем токен
      JWTService.verifyAccessToken(token);
      console.log('✅ Доступ разрешен к защищенному пути:', pathname);
    } catch (error) {
      console.log('🚫 Невалидный токен для защищенного пути:', pathname);
      
      // Очищаем невалидный токен
      const response = isProtectedApi 
        ? NextResponse.json(
            { success: false, message: 'Невалидный токен' },
            { status: 401 }
          )
        : NextResponse.redirect(new URL('/login', request.url));
      
      // Удаляем невалидные куки
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // 🔒 АДМИНСКИЕ ПУТИ - добавляем noindex заголовки
  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    console.log('🚫 Adding noindex headers for admin area');

    const response = NextResponse.next();

    // Добавляем заголовки
    response.headers.set(
      'X-Robots-Tag',
      'noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex',
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

    return response;
  }

  // ✅ Все проверки пройдены - пропускаем запрос
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};