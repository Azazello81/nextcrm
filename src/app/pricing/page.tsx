// app/test/page.tsx
'use client';

import { useState } from 'react';

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);

  // Эта ошибка будет перехвачена error.tsx
  if (shouldError) {
    throw new Error('Тестовая ошибка для демонстрации error.tsx');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Тест страницы ошибок</h1>
      <button
        onClick={() => setShouldError(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Вызвать ошибку во время рендера
      </button>
    </div>
  );
}
