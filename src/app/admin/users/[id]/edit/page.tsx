import EditUserClient from './EditUserClient';
import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { JWTService } from '@/lib/auth/jwt';
import { UserService } from '@/services/auth/user.service';
import { UserRole, User } from '@/types/admin';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const h = await headers();
  const c = await cookies();

  // Проверяем роль администратора через заголовки, middleware или токен
  const headerRole = h.get('x-user-role');
  const authHeader = h.get('authorization') || undefined;
  const cookieToken = c.get('auth_token')?.value;

  let isAdmin = false;

  if (headerRole) {
    isAdmin = headerRole.toUpperCase() === 'ADMIN';
  } else {
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : cookieToken;
    if (!token) {
      redirect('/login');
    }

    try {
      const payload = JWTService.verifyAccessToken(token!);
      isAdmin = (payload?.role || '').toUpperCase() === 'ADMIN';
    } catch (err) {
      console.warn('Failed to verify token in server page:', err);
      redirect('/login');
    }
  }

  if (!isAdmin) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const userId = resolvedParams?.id;

  if (!userId) {
    // Не валидный маршрут — перенаправим назад к списку
    redirect('/admin/users');
  }

  const u = await UserService.getUserById(userId);

  const initialUser: User = {
    id: u.id,
    firstName: u.firstName ?? undefined,
    lastName: u.lastName ?? undefined,
    middleName: u.middleName ?? undefined,
    email: u.email || '',
    phone: u.phone || '',
    avatar: u.avatar ?? undefined,
    role: (u.role || 'USER') as UserRole,
    comment: u.comment ?? undefined,
    registeredAt: u.registeredAt ?? undefined,
    lastLoginAt: u.lastLoginAt ?? undefined,
    createdAt: u.createdAt ?? undefined,
    isActive: u.isActive,
  };

  return <EditUserClient initialUser={initialUser} />;
}
