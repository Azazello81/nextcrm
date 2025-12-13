// src/lib/auth/auth-config.ts

export const authConfig = {
  // Глобальное отключение всех способов входа/регистрации
  disabled: process.env.AUTH_DISABLED === 'true',

  // Отключение отдельных методов

  email: process.env.AUTH_EMAIL_ENABLED !== 'false',
  phone: process.env.AUTH_PHONE_SMS_ENABLED !== 'false',
  vk: process.env.AUTH_VK_ENABLED !== 'false',
  yandex: process.env.AUTH_YANDEX_ENABLED !== 'false',
  telegram: process.env.AUTH_TELEGRAM_ENABLED !== 'false',
};

export type AuthMethod = 'email' | 'phone' | 'vk' | 'yandex' | 'telegram';
