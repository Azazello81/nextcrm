// src/app/test-loading/page.tsx
'use client';

import { useState } from 'react';
import {
  LoadingSpinner,
  PageLoading,
  SectionLoading,
  InlineLoading,
  CompactLoading,
  FullScreenLoading,
  OverlayLoading,
  PrimarySpinner,
  AccentSpinner,
  SuccessSpinner,
  ErrorSpinner,
  WarningSpinner,
  PurpleSpinner,
  PinkSpinner,
  GraySpinner,
  WhiteSpinner,
  GradientBlueSpinner,
  RainbowSpinner,
} from '@/components/ui/LoadingSpinner';

export default function TestLoadingPage() {
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const simulateFullScreen = () => {
    setShowFullScreen(true);
    setTimeout(() => setShowFullScreen(false), 2000);
  };

  const simulateOverlay = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 2000);
  };

  return (
    <div className="min-h-screen bg-primary p-8">
      <h1 className="text-3xl font-bold text-primary mb-8">Тестирование Loading Spinners</h1>

      {/* Основной спиннер с разными размерами */}
      <section className="mb-12 card p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Основной LoadingSpinner</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Small</h3>
            <LoadingSpinner size="sm" text="Загрузка..." />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Medium</h3>
            <LoadingSpinner size="md" text="Загрузка..." />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Large</h3>
            <LoadingSpinner size="lg" text="Загрузка..." />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Extra Large</h3>
            <LoadingSpinner size="xl" text="Загрузка..." />
          </div>
        </div>
      </section>

      {/* Спиннеры с разной скоростью */}
      <section className="mb-12 card p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Разная скорость вращения</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Медленно</h3>
            <LoadingSpinner size="md" text="Slow Speed" speed="slow" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Нормально</h3>
            <LoadingSpinner size="md" text="Normal Speed" speed="normal" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">Быстро</h3>
            <LoadingSpinner size="md" text="Fast Speed" speed="fast" />
          </div>
        </div>
      </section>

      {/* Предопределенные цветные спиннеры */}
      <section className="mb-12 card p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Цветные спиннеры</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-color rounded-lg">
            <PrimarySpinner text="Primary" />
            <p className="text-sm text-secondary mt-2">Основной синий</p>
          </div>
          <div className="text-center p-4 border border-color rounded-lg">
            <AccentSpinner text="Accent" />
            <p className="text-sm text-secondary mt-2">Акцентный цвет</p>
          </div>
          <div className="text-center p-4 border border-color rounded-lg">
            <SuccessSpinner text="Success" />
            <p className="text-sm text-secondary mt-2">Успех</p>
          </div>
          <div className="text-center p-4 border border-color rounded-lg">
            <ErrorSpinner text="Error" />
            <p className="text-sm text-secondary mt-2">Ошибка</p>
          </div>
          <div className="text-center p-4 border border-color rounded-lg">
            <WarningSpinner text="Warning" />
            <p className="text-sm text-secondary mt-2">Предупреждение</p>
          </div>
          <div className="text-center p-4 border border-color rounded-lg">
            <PurpleSpinner text="Purple" />
            <p className="text-sm text-secondary mt-2">Фиолетовый</p>
          </div>
          <div className="text-center p-4 border border-color rounded-lg">
            <PinkSpinner text="Pink" />
            <p className="text-sm text-secondary mt-2">Розовый</p>
          </div>
          <div className="text-center p-4 border border-color rounded-lg">
            <GraySpinner text="Gray" />
            <p className="text-sm text-secondary mt-2">Серый</p>
          </div>
        </div>

        {/* Спиннеры на темном фоне */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Спиннеры на темном фоне</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="text-center">
                <WhiteSpinner text="На темном фоне" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg">
              <div className="text-center">
                <LoadingSpinner 
                  size="md" 
                  text="Custom Style" 
                  spinnerClassName="border-white border-t-transparent" 
                  textClassName="text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Градиентные спиннеры */}
      <section className="mb-12 card p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Градиентные спиннеры</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center p-6 border border-color rounded-lg">
            <GradientBlueSpinner text="Синий градиент" />
            <p className="text-sm text-secondary mt-2">От синего к синему</p>
          </div>
          <div className="text-center p-6 border border-color rounded-lg">
            <RainbowSpinner text="Радужный градиент" />
            <p className="text-sm text-secondary mt-2">Радужный эффект</p>
          </div>
        </div>
      </section>

      {/* Готовые варианты */}
      <section className="mb-12 card p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Готовые варианты</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-3">PageLoading (для целой страницы)</h3>
            <div className="border border-color rounded-lg p-8 h-64 flex items-center justify-center">
              <PageLoading />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">SectionLoading (для секций)</h3>
            <div className="border border-color rounded-lg p-8">
              <SectionLoading />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">InlineLoading (встроенный в текст)</h3>
            <div className="border border-color rounded-lg p-8">
              <div className="flex items-center space-x-4">
                <InlineLoading />
                <span className="text-secondary">Ожидайте загрузки данных...</span>
              </div>
              <div className="mt-4">
                <CompactLoading />
                <span className="ml-2 text-sm text-secondary">Компактная версия</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Интерактивные примеры */}
      <section className="mb-12 card p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Интерактивные примеры</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Кнопка с inline loading */}
          <div className="p-4 border border-color rounded-lg">
            <h3 className="text-lg font-medium mb-3">Кнопка с загрузкой</h3>
            <button
              onClick={simulateLoading}
              disabled={isLoading}
              className="btn-accent w-full py-3 flex items-center justify-center"
            >
              {isLoading ? <InlineLoading /> : 'Сохранить изменения'}
            </button>
            <p className="text-sm text-secondary mt-2">Нажмите для имитации загрузки</p>
          </div>

          {/* FullScreen loading */}
          <div className="p-4 border border-color rounded-lg">
            <h3 className="text-lg font-medium mb-3">FullScreen Loading</h3>
            <button
              onClick={simulateFullScreen}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Показать FullScreen
            </button>
            <p className="text-sm text-secondary mt-2">Появится на 2 секунды</p>
          </div>

          {/* Overlay loading */}
          <div className="p-4 border border-color rounded-lg">
            <h3 className="text-lg font-medium mb-3">Overlay Loading</h3>
            <button
              onClick={simulateOverlay}
              className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Показать Overlay
            </button>
            <p className="text-sm text-secondary mt-2">Появится поверх контента</p>
          </div>
        </div>
      </section>

      {/* Пример использования в реальном интерфейсе */}
      <section className="mb-12 card p-6">
        <h2 className="text-2xl font-semibold text-primary mb-6">Реальный пример</h2>
        <div className="space-y-4">
          <div className="p-4 border border-color rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Профиль пользователя</h4>
                <p className="text-sm text-secondary">Загрузка данных профиля</p>
              </div>
              {isLoading && <CompactLoading />}
            </div>
          </div>

          <div className="p-4 border border-color rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
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
              <div>
                <h4 className="font-medium">Обновление аватара</h4>
                <p className="text-sm text-secondary">
                  {isLoading ? <InlineLoading /> : 'Готово к загрузке'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border border-color rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">Обработка платежа</h4>
                <p className="text-sm text-secondary">
                  {isLoading ? 
                    <span className="inline-flex items-center">
                      <CompactLoading />
                      <span className="ml-2">Обработка...</span>
                    </span> 
                    : 'Готов к оплате'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Отображение fullscreen и overlay спиннеров */}
      {showFullScreen && <FullScreenLoading />}
      {showOverlay && <OverlayLoading />}
    </div>
  );
}