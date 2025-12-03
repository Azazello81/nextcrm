'use client';

import { useEffect, useState } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const [mounted, setMounted] = useState(false);
  const [incidentId, setIncidentId] = useState('');

  useEffect(() => {
    console.error('System Error:', error);

    const timer1 = setTimeout(() => {
      setIncidentId(`INC-${Date.now().toString(36).toUpperCase()}`);
    }, 0);

    const timer2 = setTimeout(() => {
      setMounted(true);
    }, 10);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [error]);

  const getErrorType = (message: string) => {
    if (message.includes('fetch') || message.includes('network')) return 'Network Error';
    if (message.includes('timeout')) return 'Timeout Error';
    if (message.includes('auth') || message.includes('permission')) return 'Authorization Error';
    return 'Runtime Error';
  };

  const errorTime = new Date();

  if (!incidentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации об ошибке...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">NextCRM</h1>
                  <p className="text-red-100 text-sm">Critical System Alert</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">Критическая ошибка</div>
                <div className="text-white font-mono font-bold">500</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Error Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🚨</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Системная ошибка</h2>
                      <p className="text-gray-600 text-sm">Критический сбой • 500</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      Произошла непредвиденная ошибка в работе системы. Наша техническая команда уже
                      уведомлена и работает над решением проблемы.
                    </p>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm">!</span>
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold text-red-800 mb-1">
                            {getErrorType(error.message)}
                          </div>
                          <div className="text-red-700 font-mono text-xs">{error.message}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Детали инцидента
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Тип ошибки:</span>
                      <span className="font-medium text-red-600">
                        {getErrorType(error.message)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Время возникновения:</span>
                      <span className="font-medium">{errorTime.toLocaleTimeString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Статус системы:</span>
                      <span className="font-medium text-orange-600">Нестабильный</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ID инцидента:</span>
                      <span className="font-mono font-medium">{incidentId}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 text-center flex items-center justify-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Повторить запрос</span>
                  </button>
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="flex-1 bg-white text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-300 text-center flex items-center justify-center space-x-2"
                  >
                    <span>🏠</span>
                    <span>На главную</span>
                  </button>
                </div>
              </div>

              {/* Right Column - Recovery Actions */}
              <div>
                <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Рекомендуемые действия
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm">1</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-blue-800">
                          Попробуйте обновить страницу
                        </div>
                        <div className="text-blue-700 mt-1">
                          Часто это решает временные проблемы
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-sm">2</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-green-800">Проверьте подключение</div>
                        <div className="text-green-700 mt-1">Убедитесь в стабильности сети</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-600 text-sm">3</span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-orange-800">Свяжитесь с поддержкой</div>
                        <div className="text-orange-700 mt-1">Если проблема повторяется</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Техническая поддержка:</span>
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                          support@nextcrm.ru
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
                <span>NextCRM Enterprise v1.0</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>Все системы мониторятся</span>
              </div>
              <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-medium">Обнаружена критическая ошибка</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
