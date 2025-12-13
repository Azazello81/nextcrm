'use client';

import LoadingSpinner from './LoadingSpinner';

export default function InlineLoading() {
  return (
    <div className="inline-flex items-center">
      <LoadingSpinner 
        size="sm"
        text=""
        className="mr-2"
        spinnerClassName="border-current"
      />
      <span className="text-sm text-secondary">Загрузка...</span>
    </div>
  );
}

export function CompactLoading() {
  return (
    <LoadingSpinner 
      size="sm"
      text=""
      spinnerClassName="border-current w-4 h-4 border-2"
    />
  );
}