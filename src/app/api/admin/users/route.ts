// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../services/auth/user.service';
import { withErrorHandling } from '../../../../lib/api/withErrorHandling';
import { ApiError } from '../../../../lib/api/ApiError';
import { requireAdmin } from '../../../../lib/auth/apiAuth';
import { getI18nForRequest } from '../../../../lib/i18n';
import { normalizePhone } from '../../../../lib/validation/phone';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Проверяем, что админ
  const maybeAdmin = requireAdmin(request);
  if (maybeAdmin instanceof NextResponse) return maybeAdmin;

  // Можно поддержать query параметры позже (role, activeOnly, search)
  const users = await UserService.getUsers(undefined, true);
  return NextResponse.json({ success: true, data: users });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const adminCheck = requireAdmin(request);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { t } = getI18nForRequest(request);
  const body = await request.json();

  // Простейшая валидация
  const email = body.email;
  const password = body.password;

  if (!email || typeof email !== 'string' || !email.match(/^\S+@\S+\.\S+$/)) {
    throw new ApiError('invalid_email', 400);
  }

  if (password && typeof password === 'string' && password.length < 6) {
    throw new ApiError('password_too_short', 400, { min: 6 });
  }

  if (typeof body.phone !== 'undefined') {
    const normalized = normalizePhone(body.phone);
    if (!normalized) throw new ApiError('invalid_phone', 400);
    body.phone = normalized;
  }

  const created = await UserService.createUser(body);

  return NextResponse.json({ success: true, data: created }, { status: 201 });
});
