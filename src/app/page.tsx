'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '../components/ui/Header/Header';
import Footer from '../components/ui/Footer/Footer';

// Mock данные пользователя
const mockUser = {
  id: '1',
  login: 'admin',
  name: 'Администратор',
  email: 'admin@example.com',
  phone: '+79999999999',
  datereg: new Date('2024-01-01'),
  dateactiv: new Date(),
  avatar: '',
  role: 'admin' as const,
};

export default function HomePage() {
  const [user, setUser] = useState<typeof mockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Имитация проверки авторизации
    const timer = setTimeout(() => {
      setUser(mockUser);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              NextCRM
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Современная CRM система для управления вашим бизнесом
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link 
                    href="/auth/signin" 
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                  >
                    Войти в систему
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
                  >
                    Зарегистрироваться
                  </Link>
                </>
              ) : (
                <Link 
                  href={user.role === 'admin' ? '/admin' : '/user'} 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                >
                  Перейти в личный кабинет
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Возможности системы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 hover:shadow-lg rounded-lg transition-shadow duration-200">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Управление пользователями</h3>
                <p className="text-gray-600">Полный контроль над пользователями системы с различными ролями и правами доступа</p>
              </div>

              <div className="text-center p-6 hover:shadow-lg rounded-lg transition-shadow duration-200">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Безопасность</h3>
                <p className="text-gray-600">JWT аутентификация, подтверждение по email/SMS/Telegram, ролевая модель доступа</p>
              </div>

              <div className="text-center p-6 hover:shadow-lg rounded-lg transition-shadow duration-200">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Современные технологии</h3>
                <p className="text-gray-600">Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL и Docker</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12 text-gray-900">Система готова к работе</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-600">Готовность</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">v1.0</div>
                <div className="text-gray-600">Версия</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">Mock</div>
                <div className="text-gray-600">База данных</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">✓</div>
                <div className="text-gray-600">Готов к тесту</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}