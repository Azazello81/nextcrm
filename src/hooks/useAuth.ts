'use client';

import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, ApiResponse } from '@/stores/auth-store';
import { UserRole } from '@prisma/client';

export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const {
    user,
    accessToken,
    isLoading: storeLoading,
    setUserFromApi,
    logout,
    isAdmin,
    isManager,
    isUser,
    hasRole,
    hasAnyRole,
    setLoading: setStoreLoading,
  } = useAuthStore();

  const [localLoading, setLocalLoading] = useState(true);
  const isInitialMount = useRef(true);
  const hasFetchedProfile = useRef(false);
  const redirectTriggered = useRef(false);

  // Оптимизированная проверка загрузки
  const isLoading = useMemo(() => {
    return storeLoading || localLoading;
  }, [storeLoading, localLoading]);

  // Оптимизированная проверка авторизации
  const isAuthenticated = useMemo(() => {
    return !!(accessToken && user);
  }, [accessToken, user]);

  // Функция для загрузки профиля
  const fetchProfile = useCallback(async (): Promise<boolean> => {
    if (!accessToken || hasFetchedProfile.current) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return false;
        }
        return false;
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.user) {
        setUserFromApi(data);
        hasFetchedProfile.current = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      return false;
    }
  }, [accessToken, setUserFromApi, logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      // Если уже сработал редирект, не делаем ничего
      if (redirectTriggered.current) {
        return;
      }

      // Если нет токена и требуется редирект
      if (!accessToken && redirectTo) {
        redirectTriggered.current = true;
        router.push(redirectTo);
        setLocalLoading(false);
        return;
      }

      // Если есть токен
      if (accessToken) {
        // Если нет данных пользователя, загружаем профиль
        if (!user || !user.email) {
          await fetchProfile();
        } else {
          hasFetchedProfile.current = true;
          if (storeLoading) {
            setStoreLoading(false);
          }
        }
      }

      setLocalLoading(false);
    };

    // Только при первом монтировании даем задержку
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const timer = setTimeout(() => {
        initializeAuth();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      initializeAuth();
    }
  }, [router, accessToken, user, storeLoading, redirectTo, fetchProfile, setStoreLoading]);

  // Сбрасываем флаги при изменении redirectTo
  useEffect(() => {
    return () => {
      redirectTriggered.current = false;
      hasFetchedProfile.current = false;
    };
  }, [redirectTo]);

  return {
    isAuthenticated,
    user,
    loading: isLoading,
    isAdmin: isAdmin(),
    isManager: isManager(),
    isUser: isUser(),
    hasRole,
    hasAnyRole,
  };
}

export function useProtectedRoute(redirectTo: string = '/login') {
  const { isAuthenticated, user, loading } = useAuth(redirectTo);

  // Убрали логирование в продакшене
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🛡️ Protected Route:', {
        isAuthenticated,
        loading,
        hasUser: !!user,
      });
    }
  }, [isAuthenticated, loading, user]);

  return {
    isAuthenticated,
    user,
    loading,
  };
}

export function useRole(requiredRole: UserRole) {
  const { isAuthenticated, user, loading, hasRole } = useAuth();

  const hasAccess = useMemo(() => {
    return !loading && isAuthenticated && user ? hasRole(requiredRole) : false;
  }, [loading, isAuthenticated, user, hasRole, requiredRole]);

  return {
    hasAccess,
    user,
    loading,
  };
}

export function useRoles(requiredRoles: UserRole[]) {
  const { isAuthenticated, user, loading, hasAnyRole } = useAuth();

  const hasAccess = useMemo(() => {
    return !loading && isAuthenticated && user ? hasAnyRole(requiredRoles) : false;
  }, [loading, isAuthenticated, user, hasAnyRole, requiredRoles]);

  return {
    hasAccess,
    user,
    loading,
  };
}

export function useUser() {
  const user = useAuthStore((state) => state.user);
  const getFullName = useAuthStore((state) => state.getFullName);
  const getInitials = useAuthStore((state) => state.getInitials);
  const getAvatarUrl = useAuthStore((state) => state.getAvatarUrl);

  return useMemo(
    () => ({
      user,
      fullName: getFullName(),
      initials: getInitials(),
      avatarUrl: getAvatarUrl(),
    }),
    [user, getFullName, getInitials, getAvatarUrl],
  );
}

export function useProfile() {
  const { accessToken } = useAuthStore();
  const { setUserFromApi } = useAuthStore();

  const loadProfile = useCallback(async (): Promise<boolean> => {
    if (!accessToken) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          useAuthStore.getState().logout();
        }
        return false;
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.user) {
        setUserFromApi(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      return false;
    }
  }, [accessToken, setUserFromApi]);

  return {
    loadProfile,
  };
}
