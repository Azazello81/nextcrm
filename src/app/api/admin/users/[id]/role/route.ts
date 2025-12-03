// src/app/api/admin/users/[id]/role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../../services/auth/user.service';
import { ApiResponse } from '../../../../../../types/registration';
import { isValidUserRole } from '../../../../../../lib/validation/user-roles';

interface UpdateRoleRequest {
  role: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role }: UpdateRoleRequest = await request.json();
    const userId = params.id;

    if (!isValidUserRole(role)) {
      const response: ApiResponse = {
        success: false,
        message: 'Некорректная роль пользователя',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Получаем adminId из JWT токена (упрощенно)
    const authHeader = request.headers.get('authorization');
    const adminId = authHeader ? 'admin-id-from-token' : ''; // Нужно реализовать извлечение из JWT

    const updatedUser = await UserService.updateUserRole(userId, role, adminId);

    const response: ApiResponse = {
      success: true,
      message: 'Роль пользователя обновлена',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('❌ [Update Role API] Ошибка:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
    
    const response: ApiResponse = {
      success: false,
      message: errorMessage,
    };

    return NextResponse.json(response, { status: 400 });
  }
}