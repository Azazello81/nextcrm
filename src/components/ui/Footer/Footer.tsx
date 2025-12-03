'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthResponse {
  status: string;
  database: {
    status: string;
    responseTime?: string;
    message?: string;
  };
  timestamp: string;
  environment: string;
}

export default function Footer() {
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const [dbResponseTime, setDbResponseTime] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('Гость');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastChecked, setLastChecked] = useState<string>('');

  // Функция для получения реального статуса БД
  const fetchDbStatus = async () => {
    try {
      console.log('🔄 Footer: Запрос статуса БД...');
      const response = await fetch('/api/health', {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HealthResponse = await response.json();
      console.log('✅ Footer: Статус БД получен:', data.database.status);

      setDbStatus(data.database.status as 'connected' | 'disconnected');
      setDbResponseTime(data.database.responseTime || '');
      setLastChecked(new Date().toLocaleTimeString('ru-RU'));
    } catch (error) {
      console.error('❌ Footer: Ошибка получения статуса БД:', error);
      setDbStatus('disconnected');
      setDbResponseTime('');
      setLastChecked(new Date().toLocaleTimeString('ru-RU'));
    }
  };

  useEffect(() => {
    // Получаем пользователя из localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('nextcrm_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData.name || userData.login || 'Пользователь');
        } catch {
          setCurrentUser(storedUser);
        }
      }
    }

    // Первоначальная загрузка статуса БД
    fetchDbStatus();

    // Обновляем время каждую секунду
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Обновляем статус БД каждые 30 секунд
    const statusTimer = setInterval(fetchDbStatus, 30000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(statusTimer);
    };
  }, []);

  const getDbStatusColor = () => {
    switch (dbStatus) {
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-red-400';
      case 'loading':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDbStatusText = () => {
    switch (dbStatus) {
      case 'connected':
        return 'Подключено';
      case 'disconnected':
        return 'Отключено';
      case 'loading':
        return 'Загрузка...';
      default:
        return 'Неизвестно';
    }
  };

  const getDbStatusDot = () => {
    switch (dbStatus) {
      case 'connected':
        return 'bg-green-400';
      case 'disconnected':
        return 'bg-red-400';
      case 'loading':
        return 'bg-yellow-400 animate-pulse';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl font-bold">NextCRM</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              Современная CRM система для управления вашим бизнесом. Простое и эффективное решение
              для управления клиентами, задачами и проектами.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <span className="sr-only">Telegram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.78 5.42-.9 6.8-.06.67-.36.89-.89.56-2.45-1.83-3.57-2.98-5.79-4.78-.54-.45-.92-.68-.88-1.08.03-.31.46-.47.9-.34 1.55.57 4.04 1.67 4.15 1.63.03-.01.06-.28-.11-.53-.21-.31-.62-.38-.94-.33-.24.04-3.86 2.47-5.23 3.34-.52.33-.84.49-.77.92.04.28.4.4 1.12.67 1.44.54 2.18.8 3.14 1.29.44.23.8.34 1.19.33.54-.01 1.13-.38 1.47-.7 1.07-1.02 2.14-2.89 2.6-4.22.16-.47.32-1.39.35-1.66.06-.45-.12-.63-.45-.65-.15-.01-.33.03-.52.06-.43.09-1.17.31-1.96.51-.75.19-1.3.28-1.33.44-.07.31.45.44 1.24.69.78.25 1.67.57 2.18.83.63.32.96.47 1.07.78.12.31.09.78-.06 1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Возможности
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Тарифы
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Помощь
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Документация
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Конфиденциальность
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Условия использования
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar with System Info */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">© 2026 NextCRM. Все права защищены.</div>

            {/* System Information */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              {/* Version */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <span>v1.0.0</span>
              </div>

              {/* Database Status */}
              <div className="flex items-center space-x-2" title={`Проверено: ${lastChecked}`}>
                <div className={`w-2 h-2 rounded-full ${getDbStatusDot()}`}></div>
                <span>БД: {getDbStatusText()}</span>
                {dbResponseTime && (
                  <span className="text-xs text-gray-500">({dbResponseTime})</span>
                )}
              </div>

              {/* Current User */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{currentUser}</span>
              </div>

              {/* Current Time */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{currentTime.toLocaleTimeString('ru-RU')}</span>
              </div>
            </div>

            {/* Status Notice */}
            <div
              className={`text-xs px-2 py-1 rounded ${
                dbStatus === 'connected'
                  ? 'text-green-400 bg-green-900/20'
                  : dbStatus === 'disconnected'
                    ? 'text-red-400 bg-red-900/20'
                    : 'text-yellow-400 bg-yellow-900/20'
              }`}
            >
              {dbStatus === 'connected'
                ? '✅ Активно'
                : dbStatus === 'disconnected'
                  ? '❌ Ошибка'
                  : '🔄 Загрузка'}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
