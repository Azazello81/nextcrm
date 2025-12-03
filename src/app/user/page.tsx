// src/app/user/page.tsx
'use client';

import Link from 'next/link';
import { useProtectedRoute } from '../../hooks/useAuth';
import { JWTClientService } from '../../lib/auth/jwt-client';

export default function UserPage() {
  const { isAuthenticated, user, loading } = useProtectedRoute('/login');

  const handleLogout = () => {
    // Используем JWTClientService для удаления токена
    JWTClientService.removeToken();

    // 2. Удаляем куки
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // 3. Делаем запрос на сервер для очистки сессии (опционально)
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);

    // 4. Принудительно обновляем страницу чтобы сбросить кэш
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Редирект уже выполнен в хуке
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                NextCRM
              </Link>
              <nav className="flex space-x-8">
                <Link href="/user" className="text-blue-600 font-medium">
                  Личный кабинет
                </Link>
                <Link href="/user/profile" className="text-gray-500 hover:text-gray-900">
                  Профиль
                </Link>
                <Link href="/user/settings" className="text-gray-500 hover:text-gray-900">
                  Настройки
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user.name || user.login}
                {user.role === 'admin' && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    Админ
                  </span>
                )}
                {user.role === 'manager' && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Менеджер
                  </span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Личный кабинет</h1>
            <p className="text-gray-600">Добро пожаловать в ваш личный кабинет NextCRM!</p>

            {/* Информация о пользователе */}
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Ваши данные</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Логин</label>
                  <p className="font-medium">{user.login}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Имя</label>
                  <p className="font-medium">{user.name || 'Не указано'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{user.email || 'Не указан'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Телефон</label>
                  <p className="font-medium">{user.phone || 'Не указан'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Роль</label>
                  <p className="font-medium capitalize">
                    {user.role === 'admin' && 'Администратор'}
                    {user.role === 'manager' && 'Менеджер'}
                    {user.role === 'user' && 'Пользователь'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Дата регистрации</label>
                  <p className="font-medium">{user.datereg.toLocaleDateString('ru-RU')}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Последняя активность</label>
                  <p className="font-medium">{user.dateactiv.toLocaleDateString('ru-RU')}</p>
                </div>
                {user.comment && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm text-gray-500">Комментарий</label>
                    <p className="font-medium">{user.comment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Карточки функций */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900">Профиль</h3>
                <p className="text-blue-700 text-sm mt-2">Управляйте вашими данными</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900">Настройки</h3>
                <p className="text-green-700 text-sm mt-2">Настройте систему под себя</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900">Статистика</h3>
                <p className="text-purple-700 text-sm mt-2">Смотрите вашу активность</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
