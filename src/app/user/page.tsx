// src/app/user/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PageLoading } from '@components/ui/LoadingSpinner';
import { useProtectedRoute } from '@hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { useAuthStore, updateUserProfile } from '@/stores/auth-store';
import type { AuthUser } from '@/stores/auth-store';
import { useToast } from '@components/ui/Toast';
import {
  isValidPhone,
  normalizePhone,
  formatPhone as formatPhoneUtil,
} from '@/lib/validation/phone';
import { NativePhoneInput } from '@components/ui/PhoneInput';

// Компонент карточки
const InfoCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: 'spring', stiffness: 100 }}
    className={`card p-6 ${className}`}
  >
    {children}
  </motion.div>
);

// Компонент элемента информации
const InfoItem = ({
  label,
  value,
  icon,
  actions,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <div className="p-4 rounded-lg bg-linear-to-r from-slate-50 to-white border border-color">
    <div className="flex items-start space-x-3">
      {icon && <div className="p-2 rounded-lg bg-accent/10">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-secondary mb-1">{label}</p>
        <div className="font-medium text-primary">{value}</div>
      </div>
      {actions && <div className="ml-3">{actions}</div>}
    </div>
  </div>
);

// Компонент функции
const FunctionCard = ({
  title,
  description,
  icon,
  color = 'blue',
  href = '#',
  disabled = false,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
    green: 'from-green-50 to-green-100 border-green-200 text-green-900',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900',
  };

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'hover:shadow-lg cursor-pointer';

  const content = (
    <motion.div
      whileHover={!disabled ? { y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`block p-6 rounded-lg border ${colorClasses[color]} bg-linear-to-br transition-all duration-200 ${disabledClasses}`}
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-lg bg-white/50">{icon}</div>
        <div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
          {disabled && <p className="text-xs text-red-500 mt-2">Требуются дополнительные права</p>}
        </div>
      </div>
    </motion.div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} disabled={disabled} className="w-full text-left">
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={disabled ? 'pointer-events-none' : ''}>
        {content}
      </Link>
    );
  }

  return content;
};

// Компонент кнопки выхода
const LogoutButton = ({ onClick }: { onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
    >
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${isHovered ? 'rotate-12' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span className="font-medium">Выйти</span>
    </motion.button>
  );
};

// Компонент бейджа роли
const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleConfig = {
    ADMIN: {
      color: 'from-red-500 to-red-600',
      text: 'Администратор',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    MANAGER: {
      color: 'from-blue-500 to-blue-600',
      text: 'Менеджер',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    USER: {
      color: 'from-green-500 to-green-600',
      text: 'Пользователь',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  };

  const config = roleConfig[role] || roleConfig.USER;

  return (
    <div
      className={`px-3 py-1 rounded-full bg-linear-to-r ${config.color} text-white text-sm font-medium flex items-center space-x-2`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

// Основной компонент
export default function UserPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useProtectedRoute('/login');
  const { logout, isAdmin, isManager } = useAuthStore();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isScrolled, setIsScrolled] = useState(false);
  const toast = useToast();

  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyInput, setCompanyInput] = useState(user?.companyName || '');
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [lastNameInput, setLastNameInput] = useState(user?.lastName || '');
  const [lastNameLoading, setLastNameLoading] = useState(false);
  const [lastNameError, setLastNameError] = useState<string | null>(null);

  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState(user?.firstName || '');
  const [firstNameLoading, setFirstNameLoading] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);

  const [isEditingMiddleName, setIsEditingMiddleName] = useState(false);
  const [middleNameInput, setMiddleNameInput] = useState(user?.middleName || '');
  const [middleNameLoading, setMiddleNameLoading] = useState(false);
  const [middleNameError, setMiddleNameError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLastNameInput(user?.lastName || '');
    setLastNameError(null);
    setLastNameLoading(false);

    setFirstNameInput(user?.firstName || '');
    setFirstNameError(null);
    setFirstNameLoading(false);

    setMiddleNameInput(user?.middleName || '');
    setMiddleNameError(null);
    setMiddleNameLoading(false);
    setCompanyInput(user?.companyName || '');
    setCompanyError(null);
    setCompanyLoading(false);
    setPhoneInput(user?.phone || '');
    setPhoneError(null);
    setPhoneLoading(false);
  }, [user?.lastName, user?.firstName, user?.middleName, user?.companyName, user?.phone]);

  // Используем централизованные утилиты для телефонов

  function formatPhone(value: string) {
    const formatted = formatPhoneUtil(value);
    return formatted || '';
  }

  function handlePhoneInputChange(raw: string) {
    const normalized = normalizePhone(raw);
    setPhoneInput(normalized || '');
  }

  const saveProfileField = async (
    field: 'lastName' | 'firstName' | 'middleName' | 'companyName' | 'phone',
    value: string,
    setLoading: (v: boolean) => void,
    setError: (v: string | null) => void,
    setEditing: (v: boolean) => void,
  ) => {
    try {
      setLoading(true);
      setError(null);
      // Client-side validation for phone
      let valueToSend: string | undefined = value;
      if (field === 'phone') {
        const normalized = normalizePhone(value);
        if (!normalized) {
          const errMsg = 'Неверный формат телефона';
          setError(errMsg);
          toast.showToast(errMsg, 'error');
          setLoading(false);
          return;
        }
        valueToSend = normalized;
      }

      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ [field]: valueToSend }),
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const msg = data?.message || `Ошибка ${res.status}`;
        setError(msg);
        toast.showToast(msg, 'error');
      } else {
        // Обновляем профиль и при телефоне форматируем отображение
        const updatedVal = data.user[field];
        if (field === 'phone' && updatedVal) {
          setPhoneInput(formatPhoneUtil(updatedVal) || '');
        }
        updateUserProfile({ [field]: data.user[field] } as Partial<AuthUser>);
        toast.showToast('Профиль обновлен', 'success');
        setEditing(false);
      }
    } catch {
      const errMsg = 'Ошибка при сохранении';
      setError(errMsg);
      toast.showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      router.push('/');
    }
  };

  // Функция для перехода в админку
  const goToAdmin = () => {
    router.push('/admin');
  };

  // Функция для просмотра статистики
  const viewStatistics = () => {
    alert('Раздел статистики в разработке');
  };

  // Функция для форматирования даты
  const formatDate = (date?: Date | null) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Не указано';
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Получаем полное имя пользователя с учетом новых полей
  const getFullName = () => {
    if (user.firstName && user.lastName) {
      const parts = [user.lastName, user.firstName, user.middleName].filter(Boolean);
      return parts.join(' ');
    }
    return user.email.split('@')[0];
  };

  // Получаем инициалы для аватара с учетом новых полей
  const getInitials = () => {
    if (user.lastName && user.firstName) {
      return (user.lastName.charAt(0) + user.firstName.charAt(0)).toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  // Получаем отображаемое имя (либо полное имя, либо email)
  const getDisplayName = () => {
    const fullName = getFullName();
    return fullName.includes('@') ? user.email.split('@')[0] : fullName;
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Хедер */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-secondary/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Логотип и навигация */}
            <div className="flex items-center space-x-10">
              <Link href="/" className="flex items-center space-x-3 group">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="w-10 h-10 rounded-lg bg-linear-to-r from-accent to-blue-500 flex items-center justify-center shadow-md"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </motion.div>
                <span className="text-xl font-bold text-primary">NextCRM</span>
              </Link>

              <nav className="hidden md:flex space-x-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/user"
                    className="text-accent font-medium flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Личный кабинет</span>
                  </Link>
                </motion.div>

                {(isAdmin() || isManager()) && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/admin"
                      className="text-secondary hover:text-accent transition-colors duration-200 flex items-center space-x-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Админ панель</span>
                    </Link>
                  </motion.div>
                )}
              </nav>
            </div>

            {/* Информация пользователя и кнопка выхода */}
            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="text-right hidden sm:block">
                  <p className="font-medium text-primary">{getDisplayName()}</p>
                  <div className="flex items-center justify-end space-x-2 mt-1">
                    <RoleBadge role={user.role} />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-accent to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
                  {getInitials()}
                </div>
              </motion.div>
              <LogoutButton onClick={handleLogout} />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Приветственная секция */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-2">
            Добро пожаловать, <span className="text-accent">{getDisplayName()}</span>!
          </h1>
          <p className="text-secondary">Управляйте вашим аккаунтом и настройками системы</p>
        </motion.div>

        {/* Основная информация пользователя */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <InfoCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-primary">Основная информация</h2>
              <div className="p-2 rounded-lg bg-accent/10">
                <svg
                  className="w-6 h-6 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                label="Email"
                value={user.email}
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />

              <InfoItem
                label="Роль в системе"
                value={
                  user.role === 'ADMIN'
                    ? 'Администратор'
                    : user.role === 'MANAGER'
                      ? 'Менеджер'
                      : 'Пользователь'
                }
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
              />

              {/* Новые поля профиля */}
              <InfoItem
                label="Фамилия"
                value={
                  isEditingLastName ? (
                    <div>
                      <input
                        type="text"
                        value={lastNameInput}
                        onChange={(e) => setLastNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !lastNameLoading) {
                            saveProfileField(
                              'lastName',
                              lastNameInput,
                              setLastNameLoading,
                              setLastNameError,
                              setIsEditingLastName,
                            );
                          }
                          if (e.key === 'Escape') {
                            setIsEditingLastName(false);
                            setLastNameInput(user.lastName || '');
                            setLastNameError(null);
                          }
                        }}
                        className="w-full p-2 border border-gray-200 rounded bg-white text-primary"
                        placeholder="Введите фамилию"
                      />
                      {lastNameError && (
                        <p className="text-sm text-red-500 mt-1">{lastNameError}</p>
                      )}
                    </div>
                  ) : (
                    user.lastName || 'Не указано'
                  )
                }
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                actions={
                  isEditingLastName ? (
                    <div className="flex items-center space-x-2">
                      <button
                        title="Сохранить"
                        onClick={() =>
                          saveProfileField(
                            'lastName',
                            lastNameInput,
                            setLastNameLoading,
                            setLastNameError,
                            setIsEditingLastName,
                          )
                        }
                        className="p-2 rounded bg-accent text-white"
                        disabled={lastNameLoading}
                      >
                        {lastNameLoading ? (
                          '...'
                        ) : (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        title="Отмена"
                        onClick={() => {
                          setIsEditingLastName(false);
                          setLastNameInput(user.lastName || '');
                          setLastNameError(null);
                        }}
                        className="p-2 rounded bg-gray-200 text-secondary"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingLastName(true)}
                      className="p-2 rounded hover:bg-accent/10 transition-colors"
                      aria-label="Редактировать фамилию"
                    >
                      <svg
                        className="w-4 h-4 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5h6M7 11l8-8m-2 2l-8 8v4h4l8-8"
                        />
                      </svg>
                    </button>
                  )
                }
              />

              <InfoItem
                label="Имя"
                value={
                  isEditingFirstName ? (
                    <div>
                      <input
                        type="text"
                        value={firstNameInput}
                        onChange={(e) => setFirstNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !firstNameLoading) {
                            saveProfileField(
                              'firstName',
                              firstNameInput,
                              setFirstNameLoading,
                              setFirstNameError,
                              setIsEditingFirstName,
                            );
                          }
                          if (e.key === 'Escape') {
                            setIsEditingFirstName(false);
                            setFirstNameInput(user.firstName || '');
                            setFirstNameError(null);
                          }
                        }}
                        className="w-full p-2 border border-gray-200 rounded bg-white text-primary"
                        placeholder="Введите имя"
                      />
                      {firstNameError && (
                        <p className="text-sm text-red-500 mt-1">{firstNameError}</p>
                      )}
                    </div>
                  ) : (
                    user.firstName || 'Не указано'
                  )
                }
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                actions={
                  isEditingFirstName ? (
                    <div className="flex items-center space-x-2">
                      <button
                        title="Сохранить"
                        onClick={() =>
                          saveProfileField(
                            'firstName',
                            firstNameInput,
                            setFirstNameLoading,
                            setFirstNameError,
                            setIsEditingFirstName,
                          )
                        }
                        className="p-2 rounded bg-accent text-white"
                        disabled={firstNameLoading}
                      >
                        {firstNameLoading ? (
                          '...'
                        ) : (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        title="Отмена"
                        onClick={() => {
                          setIsEditingFirstName(false);
                          setFirstNameInput(user.firstName || '');
                          setFirstNameError(null);
                        }}
                        className="p-2 rounded bg-gray-200 text-secondary"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingFirstName(true)}
                      className="p-2 rounded hover:bg-accent/10 transition-colors"
                      aria-label="Редактировать имя"
                    >
                      <svg
                        className="w-4 h-4 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5h6M7 11l8-8m-2 2l-8 8v4h4l8-8"
                        />
                      </svg>
                    </button>
                  )
                }
              />

              <InfoItem
                label="Отчество"
                value={
                  isEditingMiddleName ? (
                    <div>
                      <input
                        type="text"
                        value={middleNameInput}
                        onChange={(e) => setMiddleNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !middleNameLoading) {
                            saveProfileField(
                              'middleName',
                              middleNameInput,
                              setMiddleNameLoading,
                              setMiddleNameError,
                              setIsEditingMiddleName,
                            );
                          }
                          if (e.key === 'Escape') {
                            setIsEditingMiddleName(false);
                            setMiddleNameInput(user.middleName || '');
                            setMiddleNameError(null);
                          }
                        }}
                        className="w-full p-2 border border-gray-200 rounded bg-white text-primary"
                        placeholder="Введите отчество"
                      />
                      {middleNameError && (
                        <p className="text-sm text-red-500 mt-1">{middleNameError}</p>
                      )}
                    </div>
                  ) : (
                    user.middleName || 'Не указано'
                  )
                }
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                }
                actions={
                  isEditingMiddleName ? (
                    <div className="flex items-center space-x-2">
                      <button
                        title="Сохранить"
                        onClick={() =>
                          saveProfileField(
                            'middleName',
                            middleNameInput,
                            setMiddleNameLoading,
                            setMiddleNameError,
                            setIsEditingMiddleName,
                          )
                        }
                        className="p-2 rounded bg-accent text-white"
                        disabled={middleNameLoading}
                      >
                        {middleNameLoading ? (
                          '...'
                        ) : (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        title="Отмена"
                        onClick={() => {
                          setIsEditingMiddleName(false);
                          setMiddleNameInput(user.middleName || '');
                          setMiddleNameError(null);
                        }}
                        className="p-2 rounded bg-gray-200 text-secondary"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingMiddleName(true)}
                      className="p-2 rounded hover:bg-accent/10 transition-colors"
                      aria-label="Редактировать отчество"
                    >
                      <svg
                        className="w-4 h-4 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5h6M7 11l8-8m-2 2l-8 8v4h4l8-8"
                        />
                      </svg>
                    </button>
                  )
                }
              />

              <InfoItem
                label="Компания"
                value={
                  isEditingCompany ? (
                    <div>
                      <input
                        type="text"
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !companyLoading) {
                            saveProfileField(
                              'companyName',
                              companyInput,
                              setCompanyLoading,
                              setCompanyError,
                              setIsEditingCompany,
                            );
                          }
                          if (e.key === 'Escape') {
                            setIsEditingCompany(false);
                            setCompanyInput(user.companyName || '');
                            setCompanyError(null);
                          }
                        }}
                        className="w-full p-2 border border-gray-200 rounded bg-white text-primary"
                        placeholder="Введите название компании"
                      />
                      {companyError && <p className="text-sm text-red-500 mt-1">{companyError}</p>}
                    </div>
                  ) : (
                    user.companyName || 'Не указано'
                  )
                }
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                }
                actions={
                  isEditingCompany ? (
                    <div className="flex items-center space-x-2">
                      <button
                        title="Сохранить"
                        onClick={() =>
                          saveProfileField(
                            'companyName',
                            companyInput,
                            setCompanyLoading,
                            setCompanyError,
                            setIsEditingCompany,
                          )
                        }
                        className="p-2 rounded bg-accent text-white"
                        disabled={companyLoading}
                      >
                        {companyLoading ? (
                          '...'
                        ) : (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        title="Отмена"
                        onClick={() => {
                          setIsEditingCompany(false);
                          setCompanyInput(user.companyName || '');
                          setCompanyError(null);
                        }}
                        className="p-2 rounded bg-gray-200 text-secondary"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingCompany(true)}
                      className="p-2 rounded hover:bg-accent/10 transition-colors"
                      aria-label="Редактировать компанию"
                    >
                      <svg
                        className="w-4 h-4 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5h6M7 11l8-8m-2 2l-8 8v4h4l8-8"
                        />
                      </svg>
                    </button>
                  )
                }
              />

              <InfoItem
                label="Телефон"
                value={
                  isEditingPhone ? (
                    <div>
                      <NativePhoneInput
                        value={phoneInput}
                        onChange={(normalized) => handlePhoneInputChange(normalized || '')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !phoneLoading) {
                            saveProfileField(
                              'phone',
                              phoneInput,
                              setPhoneLoading,
                              setPhoneError,
                              setIsEditingPhone,
                            );
                          }
                          if (e.key === 'Escape') {
                            setIsEditingPhone(false);
                            setPhoneInput(user.phone || '');
                            setPhoneError(null);
                          }
                        }}
                        className="w-full p-2 border border-gray-200 rounded bg-white text-primary"
                        placeholder="Введите телефон"
                      />
                      {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
                    </div>
                  ) : user.phone ? (
                    formatPhone(user.phone)
                  ) : (
                    'Не указано'
                  )
                }
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
                actions={
                  isEditingPhone ? (
                    <div className="flex items-center space-x-2">
                      <button
                        title="Сохранить"
                        onClick={() =>
                          saveProfileField(
                            'phone',
                            phoneInput,
                            setPhoneLoading,
                            setPhoneError,
                            setIsEditingPhone,
                          )
                        }
                        className="p-2 rounded bg-accent text-white"
                        disabled={phoneLoading}
                      >
                        {phoneLoading ? (
                          '...'
                        ) : (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        title="Отмена"
                        onClick={() => {
                          setIsEditingPhone(false);
                          setPhoneInput(user.phone || '');
                          setPhoneError(null);
                        }}
                        className="p-2 rounded bg-gray-200 text-secondary"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="p-2 rounded hover:bg-accent/10 transition-colors"
                      aria-label="Редактировать телефон"
                    >
                      <svg
                        className="w-4 h-4 text-secondary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5h6M7 11l8-8m-2 2l-8 8v4h4l8-8"
                        />
                      </svg>
                    </button>
                  )
                }
              />

              <InfoItem
                label="Дата регистрации"
                value={formatDate(user.registeredAt)}
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />

              <InfoItem
                label="Последний вход"
                value={formatDate(user.lastLoginAt)}
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />

              <InfoItem
                label="ID пользователя"
                value={user.id}
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                }
              />

              <InfoItem
                label="Статус аккаунта"
                value={user.isActive ? 'Активен' : 'Неактивен'}
                icon={
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
            </div>
          </InfoCard>
        </motion.div>

        {/* Функциональные карточки */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-primary mb-6">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FunctionCard
              title="Админ панель"
              description="Управление пользователями и настройками системы"
              icon={
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
              color="blue"
              disabled={!isAdmin() && !isManager()}
              onClick={goToAdmin}
            />

            <FunctionCard
              title="Настройки профиля"
              description="Измените ваши личные данные и настройки безопасности"
              icon={
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              }
              color="green"
              href="/user/settings"
            />

            <FunctionCard
              title="Статистика"
              description="Просмотр вашей активности и использования системы"
              icon={
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              color="purple"
              onClick={viewStatistics}
            />
          </div>
        </motion.div>

        {/* Дополнительная информация */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Права доступа */}
            <InfoCard>
              <h3 className="text-lg font-semibold text-primary mb-4">Права доступа</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-50 to-white">
                  <span className="text-secondary">Админ панель</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isAdmin() || isManager()
                        ? 'bg-linear-to-r from-green-500 to-green-600 text-white'
                        : 'bg-linear-to-r from-gray-300 to-gray-400 text-gray-700'
                    }`}
                  >
                    {isAdmin() || isManager() ? 'Доступно' : 'Недоступно'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-50 to-white">
                  <span className="text-secondary">Управление пользователями</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isAdmin()
                        ? 'bg-linear-to-r from-green-500 to-green-600 text-white'
                        : isManager()
                          ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-linear-to-r from-gray-300 to-gray-400 text-gray-700'
                    }`}
                  >
                    {isAdmin() ? 'Полный доступ' : isManager() ? 'Ограниченный' : 'Недоступно'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-linear-to-r from-slate-50 to-white">
                  <span className="text-secondary">Настройки системы</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isAdmin()
                        ? 'bg-linear-to-r from-green-500 to-green-600 text-white'
                        : 'bg-linear-to-r from-gray-300 to-gray-400 text-gray-700'
                    }`}
                  >
                    {isAdmin() ? 'Доступно' : 'Недоступно'}
                  </span>
                </div>
              </div>
            </InfoCard>

            {/* Быстрые ссылки */}
            <InfoCard>
              <h3 className="text-lg font-semibold text-primary mb-4">Полезные ссылки</h3>
              <div className="space-y-3">
                <Link
                  href="/help"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-linear-to-r from-slate-50 to-white transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-primary">Помощь и поддержка</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                <Link
                  href="/docs"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-linear-to-r from-slate-50 to-white transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-5 h-5 text-secondary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span className="text-primary">Документация</span>
                  </div>
                  <svg
                    className="w-4 h-4 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </InfoCard>
          </div>
        </motion.div>
      </main>

      {/* Футер */}
      <footer className="mt-12 border-t border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-secondary">
                © {new Date().getFullYear()} NextCRM. Все права защищены.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-secondary hover:text-accent transition-colors"
              >
                Конфиденциальность
              </Link>
              <Link
                href="/terms"
                className="text-sm text-secondary hover:text-accent transition-colors"
              >
                Условия использования
              </Link>
              <Link
                href="/contact"
                className="text-sm text-secondary hover:text-accent transition-colors"
              >
                Контакты
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
