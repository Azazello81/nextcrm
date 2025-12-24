// src/app/api/admin/users/[id]/role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../../services/auth/user.service';
import { ApiResponse } from '../../../../../../types/registration';
import { requireAdmin } from '../../../../../../lib/auth/apiAuth';
import { isValidUserRole } from '../../../../../../lib/validation/user-roles';
import { withErrorHandling } from '../../../../../../lib/api/withErrorHandling';
import { ApiError } from '../../../../../../lib/api/ApiError';
import { getI18nForRequest } from '../../../../../../lib/i18n';

interface UpdateRoleRequest {
  role: string;
}

export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { role }: UpdateRoleRequest = await request.json();
    const userId = params.id;

    const { t } = getI18nForRequest(request);

    if (!isValidUserRole(role)) {
      throw new ApiError('invalid_role', 400);
    }

    // Получаем adminId из JWT
    const adminCheck = requireAdmin(request);
    if (adminCheck instanceof NextResponse) return adminCheck;

    const updatedUser = await UserService.updateUserRole(userId, role, adminCheck.userId);

    const response: ApiResponse = {
      success: true,
      message: t('role_updated'),
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };

    return NextResponse.json(response);
  },
);
