'use client';

import LoadingSpinner from './LoadingSpinner';

export function PrimarySpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-blue-500 border-t-transparent"
      textClassName="text-blue-600"
      {...props}
    />
  );
}

export function AccentSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-accent border-t-transparent"
      textClassName="text-accent"
      {...props}
    />
  );
}

export function SuccessSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-green-500 border-t-transparent"
      textClassName="text-green-600"
      {...props}
    />
  );
}

export function ErrorSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-red-500 border-t-transparent"
      textClassName="text-red-600"
      {...props}
    />
  );
}

export function WarningSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-yellow-500 border-t-transparent"
      textClassName="text-yellow-600"
      {...props}
    />
  );
}

export function PurpleSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-purple-500 border-t-transparent"
      textClassName="text-purple-600"
      {...props}
    />
  );
}

export function PinkSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-pink-500 border-t-transparent"
      textClassName="text-pink-600"
      {...props}
    />
  );
}

export function GraySpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-gray-400 border-t-transparent"
      textClassName="text-gray-600"
      {...props}
    />
  );
}

export function WhiteSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-white border-t-transparent"
      textClassName="text-white"
      {...props}
    />
  );
}

// Упрощенная версия без сложных градиентов
export function GradientBlueSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-blue-400 border-t-transparent"
      textClassName="text-blue-600"
      {...props}
    />
  );
}

export function RainbowSpinner(props: React.ComponentProps<typeof LoadingSpinner>) {
  return (
    <LoadingSpinner
      spinnerClassName="border-red-400 border-t-transparent"
      textClassName="text-transparent bg-linear-to-r from-red-600 via-yellow-600 to-blue-600 bg-clip-text"
      {...props}
    />
  );
}
