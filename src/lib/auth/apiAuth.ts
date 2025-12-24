// src/lib/auth/apiAuth.ts
import { NextRequest, NextResponse } from 'next/server';
import { JWTService, JWTPayload } from './jwt';
import { getI18nForRequest } from '../i18n';

export const getTokenFromRequest = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7);
  const cookieToken = request.cookies.get('auth_token')?.value;
  return cookieToken || null;
};

export const getPayloadFromRequest = (request: NextRequest): JWTPayload | null => {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    return JWTService.verifyAccessToken(token);
  } catch (err) {
    return null;
  }
};

export const requireAdmin = (
  request: NextRequest,
): { userId: string; email?: string } | NextResponse => {
  // Prefer headers injected by global middleware
  const headerRole = request.headers.get('x-user-role');
  const headerId = request.headers.get('x-user-id');
  const headerEmail = request.headers.get('x-user-email') || undefined;

  if (headerRole) {
    if (headerRole.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Недостаточно прав доступа' },
        { status: 403 },
      );
    }

    if (!headerId) {
      return NextResponse.json(
        { success: false, message: 'Требуется аутентификация' },
        { status: 401 },
      );
    }

    return { userId: headerId, email: headerEmail };
  }

  // Fallback to token verification (backwards compatibility)
  const payload = getPayloadFromRequest(request);
  if (!payload) {
    const { t } = getI18nForRequest(request);
    return NextResponse.json({ success: false, message: t('requires_auth') }, { status: 401 });
  }

  if (!payload.role || payload.role.toUpperCase() !== 'ADMIN') {
    const { t } = getI18nForRequest(request);
    return NextResponse.json({ success: false, message: t('forbidden') }, { status: 403 });
  }

  return { userId: payload.userId, email: payload.email };
};
