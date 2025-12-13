'use client';

import LoadingSpinner from './LoadingSpinner';

export default function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <LoadingSpinner 
        size="lg"
        text="Загрузка страницы..."
        spinnerClassName="border-accent"
        textClassName="text-primary font-medium"
      />
    </div>
  );
}

// Альтернатива - статичная версия для SSR
export function StaticPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full" />
        <p className="mt-6 text-primary font-medium">Загрузка страницы...</p>
      </div>
    </div>
  );
}