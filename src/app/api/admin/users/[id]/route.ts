// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../services/auth/user.service';
import { withErrorHandling } from '../../../../../lib/api/withErrorHandling';
import { isValidUserRole } from '../../../../../lib/validation/user-roles';
import { normalizePhone } from '../../../../../lib/validation/phone';
import { ApiError } from '../../../../../lib/api/ApiError';
import { requireAdmin } from '../../../../../lib/auth/apiAuth';
import { getI18nForRequest } from '../../../../../lib/i18n';

export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const userId = params?.id ?? new URL(request.url).pathname.split('/').filter(Boolean).pop();

    if (!userId) {
      console.warn('[User GET] missing id param', { params, url: request.url });
      throw new ApiError('missing_user_id', 400);
    }

    const user = await UserService.getUserById(userId);
    return NextResponse.json({ success: true, data: user });
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { t } = getI18nForRequest(request);

    const userId = params?.id ?? new URL(request.url).pathname.split('/').filter(Boolean).pop();
    if (!userId) {
      console.warn('[User PATCH] missing id param', { params, url: request.url });
      throw new ApiError('missing_user_id', 400);
    }

    const body = await request.json();

    // Базовая валидация
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      throw new ApiError('invalid_email', 400);
    }

    if (
      typeof body.firstName !== 'undefined' &&
      (!body.firstName || String(body.firstName).trim().length === 0)
    ) {
      throw new ApiError('invalid_first_name', 400);
    }

    if (
      typeof body.lastName !== 'undefined' &&
      (!body.lastName || String(body.lastName).trim().length === 0)
    ) {
      throw new ApiError('invalid_last_name', 400);
    }

    // Валидируем роль отдельно и обновляем при необходимости
    let roleChanged = false;
    if (typeof body.role !== 'undefined') {
      if (!isValidUserRole(body.role)) {
        throw new ApiError('invalid_role', 400);
      }
      // обновим роль через специализированный метод, чтобы скрыть бизнес-логику
      await UserService.updateUserRole(userId, body.role.toUpperCase(), adminCheck.userId);
      roleChanged = true;
    }

    // Собираем остальные поля для обновления профиля
    const updates: Record<string, any> = {};
    if (typeof body.firstName !== 'undefined') updates.firstName = body.firstName;
    if (typeof body.lastName !== 'undefined') updates.lastName = body.lastName;
    if (typeof body.middleName !== 'undefined') updates.middleName = body.middleName;
    if (typeof body.phone !== 'undefined') {
      const normalized = normalizePhone(body.phone);
      if (!normalized) {
        throw new ApiError('invalid_phone', 400);
      }
      updates.phone = normalized;
    }
    if (typeof body.email !== 'undefined') updates.email = body.email;

    let updated: any = null;
    if (Object.keys(updates).length > 0) {
      updated = await UserService.updateProfile(userId, updates);
    }

    // Если обновляли только роль, вернём текущего пользователя
    if (!updated && roleChanged) {
      updated = await UserService.getUserById(userId);
    }

    return NextResponse.json({ success: true, message: t('user_updated'), data: updated });
  },
);

export const DELETE = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const { t } = getI18nForRequest(request);

    const userId = params?.id ?? new URL(request.url).pathname.split('/').filter(Boolean).pop();

    if (!userId) {
      console.warn('[User DELETE] missing id param', { params, url: request.url });
      throw new ApiError('missing_user_id', 400);
    }

    // Признак жёсткого удаления (query ?hard=true)
    const url = new URL(request.url);
    const hard = url.searchParams.get('hard') === 'true' || url.searchParams.get('hard') === '1';

    if (hard) {
      const deleted = await UserService.hardDeleteUser(userId, adminCheck.userId);
      return NextResponse.json({ success: true, data: deleted });
    }

    const deactivated = await UserService.deactivateUser(userId, adminCheck.userId);
    return NextResponse.json({ success: true, message: t('user_updated'), data: deactivated });
  },
);
