// src/proxy.ts (с правильным экспортом)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTService } from './lib/auth/jwt';
import { getI18nForRequest } from './lib/i18n';
import { UserRole } from '@prisma/client';

// Конфигурация защищенных путей и необходимых ролей
const protectedRoutes: Record<string, UserRole[]> = {
  '/admin': ['ADMIN', 'MANAGER'],
  '/user': ['ADMIN', 'MANAGER', 'USER'],
  '/api/admin': ['ADMIN'],
  '/api/user': ['ADMIN', 'MANAGER', 'USER'],
};

// Публичные пути
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify',
  '/api/auth/resend-code',
  '/api/auth/logout',
  '/api/auth/debug',
  '/api/health',
  '/robots.txt',
  '/sitemap.xml',
];

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Вспомогательные функции
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(path + '/') ||
      (path.endsWith('.txt') && pathname === path) ||
      (path.endsWith('.xml') && pathname === path),
  );
}

function getToken(request: NextRequest): string | null {
  // Проверяем cookie
  const cookieToken = request.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  // Проверяем Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

function getClientIP(request: NextRequest): string {
  // Получаем IP из различных заголовков
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    return ips[0].trim();
  }

  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}

function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === 'ADMIN') return true;
  return allowedRoles.includes(userRole);
}

function checkRateLimit(ip: string, path: string): boolean {
  const key = `${ip}:${path}`;
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  // Ограничения
  const maxRequests = path.startsWith('/api/auth') ? 10 : 100;
  const windowMs = 60 * 1000; // 1 минута

  // Периодическая очистка устаревших записей
  if (Math.random() < 0.01) {
    // 1% chance to cleanup
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

// Экспортируем функцию с именем 'proxy' для Next.js 16.0.7
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const { t } = getI18nForRequest(request);

  // Логирование в development
  if (process.env.NODE_ENV === 'development') {
    const shouldLog =
      !pathname.match(/\.(ico|png|jpg|jpeg|css|js|svg|gif|webp)$/) &&
      !pathname.startsWith('/_next/');

    if (shouldLog) {
      console.log('🛠️ Proxy Middleware:', {
        path: pathname,
        method: request.method,
        ip: ip,
        time: new Date().toLocaleTimeString(),
      });
    }
  }

  // Пропускаем публичные пути
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Проверка rate limiting для API
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip, pathname)) {
      console.log(`🚫 Rate limit exceeded: ${ip} - ${pathname}`);
      return NextResponse.json({ success: false, message: t('rate_limit') }, { status: 429 });
    }
  }

  // Определяем защищенный ли это путь
  let allowedRoles: UserRole[] = [];

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      allowedRoles = roles;
      break;
    }
  }

  // Если путь не защищенный, пропускаем
  if (allowedRoles.length === 0) {
    return NextResponse.next();
  }

  console.log(`🔐 Проверка доступа к: ${pathname}, разрешенные роли: ${allowedRoles.join(', ')}`);

  // Получаем токен
  const token = getToken(request);

  if (!token) {
    console.log(`🚫 Доступ запрещен: нет токена для ${pathname}`);

    // Для API возвращаем 401, для страниц - редирект
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: t('requires_auth') }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Проверяем токен
  try {
    const payload = JWTService.verifyAccessToken(token);
    console.log(`✅ Токен валиден: ${payload.email}, роль: ${payload.role}`);

    // Проверяем роль
    if (payload.role && !hasAccess(payload.role as UserRole, allowedRoles)) {
      console.log(`🚫 Недостаточно прав: ${payload.role} → ${pathname}`);

      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, message: t('forbidden') }, { status: 403 });
      }

      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log(`✅ Доступ разрешен: ${pathname}`);

    // Создаем ответ
    const response = NextResponse.next();

    // Добавляем информацию о пользователе в заголовки
    if (payload.userId) {
      response.headers.set('x-user-id', payload.userId.toString());
    }
    if (payload.email) {
      response.headers.set('x-user-email', payload.email);
    }
    response.headers.set('x-user-role', payload.role || 'USER');

    // Добавляем заголовки безопасности для защищенных областей
    if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
      console.log('🚫 Adding noindex headers for protected area');
      response.headers.set(
        'X-Robots-Tag',
        'noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex',
      );
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    }

    // Общие заголовки безопасности
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');

    return response;
  } catch (error) {
    console.log(`🚫 Невалидный токен для: ${pathname}`, error);

    let response: NextResponse;

    if (pathname.startsWith('/api/')) {
      response = NextResponse.json(
        { success: false, message: t('token_invalid') },
        { status: 401 },
      );
    } else {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      response = NextResponse.redirect(loginUrl);
    }

    // Удаляем невалидный токен
    response.cookies.delete('auth_token');

    return response;
  }
}

// Также можно использовать default export
// export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
