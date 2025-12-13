'use client';

import LoadingSpinner from './LoadingSpinner';

export default function FullScreenLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/95 backdrop-blur-sm">
      <LoadingSpinner 
        size="xl"
        text=""
        spinnerClassName="border-gray-300"
        textClassName="text-secondary"
      />
    </div>
  );
}

export function OverlayLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-secondary rounded-xl p-8 shadow-2xl">
        <LoadingSpinner 
          size="lg"
          text="Обработка..."
          spinnerClassName="border-accent"
          textClassName="text-primary"
        />
      </div>
    </div>
  );
}