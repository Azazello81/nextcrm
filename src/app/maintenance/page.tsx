// src/app/maintenance/page.tsx (минимальная версия)
'use client';

import { useEffect, useState } from 'react';

export default function MaintenancePage() {
  const [time, setTime] = useState('');

  useEffect(() => {
    document.title = 'Технические работы';
    
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('ru-RU'));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Технические работы
          </h1>
          <p className="text-slate-600 mb-8">
            Сайт временно недоступен. Мы работаем над улучшением сервиса.
          </p>
          
          <div className="mb-6">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
            </div>
            <div className="text-sm text-slate-500 mt-2">
              Прогресс: ~2-3 часа
            </div>
          </div>
          
          <div className="text-slate-700 mb-6">
            Текущее время: <span className="font-mono">{time}</span>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
        
        <div className="mt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} Ваша компания
        </div>
      </div>
    </div>
  );
}