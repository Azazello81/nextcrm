'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const professionalMessages = [
    'Запрошенная страница временно недоступна или была перемещена',
    'Ресурс, который вы ищете, в настоящее время не найден в системе',
    '404: Указанный адрес не соответствует ни одному из доступных маршрутов',
    'Данный раздел находится в процессе обновления или был архивирован',
    'Страница, которую вы запрашиваете, больше не существует в этой локации',
    'Возможно, произошла ошибка в указании пути или ресурс был перемещен',
    'Запрашиваемый контент временно отсутствует в системе',
    'Данный URL не соответствует ни одному зарегистрированному маршруту',
  ];

  const quickActions = [
    { icon: '📊', label: 'Панель управления', path: '/admin', color: 'blue' },
    { icon: '👥', label: 'Управление пользователями', path: '/admin/users', color: 'green' },
    { icon: '⚙️', label: 'Настройки системы', path: '/admin/settings', color: 'purple' },
    { icon: '📈', label: 'Аналитика', path: '/admin/analytics', color: 'orange' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % professionalMessages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [professionalMessages.length]);

  const currentMessage = professionalMessages[currentMessageIndex];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">NextCRM</h1>
                  <p className="text-blue-100 text-sm">Business Management System</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">Код ошибки</div>
                <div className="text-white font-mono font-bold">404</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Error Info */}
              <div className="space-y-6">
                <div
                  className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Ресурс не найден</h2>
                      <p className="text-gray-600 text-sm">Системная ошибка • 404</p>
                    </div>
                  </div>

                  <div className="h-20 flex items-center">
                    <p className="text-gray-700 leading-relaxed transition-opacity duration-500">
                      {currentMessage}
                    </p>
                  </div>
                </div>

                {/* Technical Details */}
                <div
                  className={`bg-gray-50 rounded-lg p-4 transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Техническая информация
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Статус:</span>
                      <span className="font-medium">Not Found</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Код:</span>
                      <span className="font-mono font-medium">404</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Время:</span>
                      <span className="font-medium">{new Date().toLocaleTimeString('ru-RU')}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                >
                  <Link
                    href="/"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 text-center flex items-center justify-center space-x-2"
                  >
                    <span>🏠</span>
                    <span>На главную панель</span>
                  </Link>
                  <button
                    onClick={() => window.history.back()}
                    className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-300 text-center flex items-center justify-center space-x-2"
                  >
                    <span>↩️</span>
                    <span>Вернуться назад</span>
                  </button>
                </div>
              </div>

              {/* Right Column - Quick Actions */}
              <div
                className={`transition-all duration-700 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
              >
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Быстрый доступ
                  </h3>

                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <Link
                        key={action.path}
                        href={action.path}
                        className={`block p-4 rounded-xl border transition-all duration-300 transform hover:scale-105 hover:shadow-md ${getColorClasses(action.color)}`}
                        style={{ transitionDelay: `${index * 100 + 800}ms` }}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{action.icon}</span>
                          <span className="font-medium">{action.label}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Нужна помощь?</span>
                      <div className="flex space-x-3">
                        <button className="hover:text-blue-600 transition-colors">
                          📧 Поддержка
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          📚 Документация
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>NextCRM v1.0</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Система работает стабильно</span>
              </div>
            </div>
          </div>
        </div>

        {/* Easter Egg - только для внимательных */}
        <div className="mt-6 text-center opacity-0 hover:opacity-100 transition-opacity duration-500">
          <p className="text-xs text-gray-400">
            P.S. Иногда даже самые совершенные системы нуждаются в перезагрузке 🔄
          </p>
        </div>
      </div>
    </div>
  );
}
