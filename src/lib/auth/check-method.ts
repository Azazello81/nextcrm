// src/lib/auth/check-method.ts

import { NextResponse } from 'next/server';
import { authConfig } from './auth-config';

export function ensureAuthMethodEnabled(method: keyof typeof authConfig) {
  // Глобальная блокировка (отключено всё)
  if (authConfig.disabled) {
    return NextResponse.redirect('/auth-disabled');
  }
  // Отключён конкретный метод? → Показываем заглушку
  if (!authConfig[method]) {
    return NextResponse.redirect(`/auth-method-disabled/${method}`);
  }

  // Всё ок – метод разрешён
  return null;
}
