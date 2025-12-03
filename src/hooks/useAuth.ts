// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JWTClientService } from '../lib/auth/jwt-client';
import { User } from '../types/user';

export function useAuth(redirectTo: string = '/login') {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = JWTClientService.getToken();

      // Проверяем наличие и формат токена
      if (!token || !JWTClientService.isValidTokenFormat(token)) {
        console.log('🚫 Токен отсутствует или имеет неверный формат');
        handleAuthFailure();
        return;
      }

      // Проверяем не истек ли токен
      if (JWTClientService.isTokenExpired(token)) {
        console.log('🚫 Токен истек');
        handleAuthFailure();
        return;
      }

      try {
        // Получаем данные из токена
        const payload = JWTClientService.getPayloadFromToken(token);

        if (!payload) {
          throw new Error('Не удалось декодировать токен');
        }

        // Здесь можно сделать API запрос для получения полных данных пользователя
        const userData: User = {
          id: payload.userId,
          login: payload.email.split('@')[0],
          email: payload.email,
          datereg: new Date(),
          dateactiv: new Date(),
          role: 'user', // По умолчанию, можно получать с API
        };

        setLoading(false);
        setIsAuthenticated(true);
        setUser(userData);
        console.log('✅ Пользователь аутентифицирован:', payload.email);
      } catch (error) {
        console.error('❌ Ошибка при проверке токена:', error);
        handleAuthFailure();
      }
    };

    const handleAuthFailure = () => {
      JWTClientService.removeToken();
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);

      if (redirectTo) {
        setTimeout(() => router.push(redirectTo), 0);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  return {
    isAuthenticated,
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager',
    isUser: user?.role === 'user',
  };
}

// Хук для защищенных страниц (автоматический редирект)
export function useProtectedRoute(redirectTo: string = '/login') {
  const { isAuthenticated, user, loading } = useAuth(redirectTo);

  return {
    isAuthenticated,
    user,
    loading,
  };
}

// Хук для проверки одной роли
export function useRole(requiredRole: User['role']) {
  const { isAuthenticated, user, loading } = useAuth();

  const hasAccess =
    !loading && isAuthenticated && user
      ? user.role === requiredRole || user.role === 'admin'
      : null;

  return {
    hasAccess,
    user,
    loading,
  };
}

// Хук для проверки нескольких ролей
export function useRoles(requiredRoles: User['role'][]) {
  const { isAuthenticated, user, loading } = useAuth();

  const hasAccess =
    !loading && isAuthenticated && user
      ? requiredRoles.includes(user.role) || user.role === 'admin'
      : null;

  return {
    hasAccess,
    user,
    loading,
  };
}
