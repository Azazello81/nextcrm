'use client';

import LoadingSpinner from './LoadingSpinner';

export default function SectionLoading() {
  return (
    <div className="py-16 flex items-center justify-center">
      <LoadingSpinner 
        size="md"
        text="Загрузка данных..."
        spinnerClassName="border-gray-300"
        textClassName="text-secondary"
      />
    </div>
  );
}