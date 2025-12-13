import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '@prisma/client';

// Экспортируем интерфейсы
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  lastName?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  phone?: string | null;
  inn?: string | null;
  companyName?: string | null;
  avatar?: string | null;
  comment?: string | null;
  telegramId?: bigint | null;
  telegramUsername?: string | null;
  isActive: boolean;
  registeredAt?: Date | null;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser) => void;
  setUserFromApi: (apiResponse: ApiResponse) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  // Role checks
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isUser: () => boolean;

  // Helper methods
  getFullName: () => string;
  getInitials: () => string;
  getAvatarUrl: () => string | null;
  isProfileComplete: () => boolean;
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setUserFromApi: (apiResponse) => {
        if (apiResponse.success && apiResponse.user) {
          set({
            user: apiResponse.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.error('Ошибка установки пользователя из API:', apiResponse);
        }
      },

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken: refreshToken || null,
        }),

      logout: () => {
        set({
          ...initialState,
          isLoading: false,
        });

        if (typeof window !== 'undefined') {
          sessionStorage.clear();
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');

          // Также можно очистить все связанные данные
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('auth_') || key.includes('token')) {
              localStorage.removeItem(key);
            }
          });

          // Очищаем cookies через document (на всякий случай)
          document.cookie.split(';').forEach((cookie) => {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        }

        // Выполняем logout на сервере
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => {
            if (!response.ok) {
              console.error('Ошибка при выходе на сервере:', response.status);
            }
          })
          .catch((error) => {
            console.error('Ошибка при запросе logout:', error);
          });
      },

      clearAuth: () => set(initialState),

      setLoading: (loading) => {
        console.log('🔄 Store loading:', loading);
        set({ isLoading: loading });
      },

      // Проверка ролей
      hasRole: (role) => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return false;
        if (user.role === 'ADMIN') return true;
        return user.role === role;
      },

      hasAnyRole: (roles) => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return false;
        if (user.role === 'ADMIN') return true;
        return roles.includes(user.role);
      },

      isAdmin: () => get().hasRole('ADMIN'),
      isManager: () => get().hasRole('MANAGER'),
      isUser: () => get().hasRole('USER'),

      // Helper методы для новых полей
      getFullName: () => {
        const { user } = get();
        if (!user) return '';

        const parts: string[] = [];
        if (user.lastName) parts.push(user.lastName);
        if (user.firstName) parts.push(user.firstName);
        if (user.middleName) parts.push(user.middleName);

        return parts.length > 0 ? parts.join(' ') : user.email;
      },

      getInitials: () => {
        const { user } = get();
        if (!user) return '';

        let initials = '';
        if (user.lastName) initials += user.lastName.charAt(0).toUpperCase();
        if (user.firstName) initials += user.firstName.charAt(0).toUpperCase();

        return initials || user.email.charAt(0).toUpperCase();
      },

      getAvatarUrl: () => {
        const { user } = get();
        if (!user?.avatar) return null;
        return user.avatar;
      },

      isProfileComplete: () => {
        const { user } = get();
        if (!user) return false;

        const hasEmail = !!user.email?.trim();
        const hasFirstName = !!user.firstName?.trim();
        const hasLastName = !!user.lastName?.trim();

        return hasEmail && hasFirstName && hasLastName;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Helper хук для удобного доступа к данным пользователя
export const useUserProfile = () => {
  const user = useAuthStore((state) => state.user);
  const getFullName = useAuthStore((state) => state.getFullName);
  const getInitials = useAuthStore((state) => state.getInitials);
  const getAvatarUrl = useAuthStore((state) => state.getAvatarUrl);
  const isProfileComplete = useAuthStore((state) => state.isProfileComplete);
  const hasRole = useAuthStore((state) => state.hasRole);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  return {
    user,
    isAuthenticated: !!user?.isActive,

    fullName: getFullName(),
    initials: getInitials(),
    avatarUrl: getAvatarUrl(),
    isProfileComplete: isProfileComplete(),

    email: user?.email,
    role: user?.role,
    companyName: user?.companyName,
    inn: user?.inn,
    comment: user?.comment,
    phone: user?.phone,
    telegramUsername: user?.telegramUsername,

    hasRole,
    hasAnyRole,
    isAdmin: hasRole('ADMIN'),
    isManager: hasRole('MANAGER'),
    isUser: hasRole('USER'),
  };
};

export const handleLogin = async (email: string, password: string) => {
  try {
    console.log('🔄 Начинаем процесс входа для:', email);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: ApiResponse = await response.json();

    console.log('📥 Ответ от сервера:', {
      success: data.success,
      hasUser: !!data.user,
      userRole: data.user?.role,
      hasToken: !!data.token,
      status: response.status,
    });

    if (!response.ok) {
      throw new Error(data.message || `Ошибка входа (${response.status})`);
    }

    if (data.success && data.user && data.token) {
      console.log('✅ Данные получены, сохраняем в store...');
      console.log('Роль пользователя:', data.user.role);
      console.log('ID пользователя:', data.user.id);

      useAuthStore.getState().setUserFromApi(data);
      useAuthStore.getState().setTokens(data.token, data.refreshToken || undefined);

      // Проверяем что данные действительно сохранились
      const storeState = useAuthStore.getState();
      console.log('📦 Состояние store после сохранения:', {
        hasUser: !!storeState.user,
        userEmail: storeState.user?.email,
        userRole: storeState.user?.role,
        hasToken: !!storeState.accessToken,
        isAuthenticated: storeState.isAuthenticated,
      });

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } else {
      console.error('❌ Некорректный ответ сервера:', data);
      throw new Error('Некорректный ответ сервера');
    }
  } catch (error) {
    console.error('💥 Ошибка в handleLogin:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Произошла неизвестная ошибка' };
  }
};

// Функция для выхода
export const handleLogout = () => {
  useAuthStore.getState().logout();
};

// Функция для обновления пользователя
export const updateUserProfile = (updates: Partial<AuthUser>): void => {
  const currentState = useAuthStore.getState();
  if (currentState.user) {
    currentState.setUser({
      ...currentState.user,
      ...updates,
    });
  }
};
