export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  exp?: number;
}

// Упрощенная клиентская версия - только базовые проверки
export class JWTClientService {
  static storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static removeToken(): void {
    localStorage.removeItem('token');
  }

  // Базовая проверка формата токена (без верификации подписи)
  static isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;

    try {
      // Проверяем, что токен состоит из трех частей (JWT формат)
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Пытаемся декодировать payload
      const payload = JSON.parse(atob(parts[1]));

      // Проверяем базовые поля (роль опциональна)
      const hasRequiredFields = !!(payload.userId && payload.email);

      // Проверяем expiration time если есть
      const isNotExpired = !payload.exp || payload.exp * 1000 > Date.now();

      return hasRequiredFields && isNotExpired;
    } catch {
      return false;
    }
  }

  // Получаем данные из токена без верификации подписи
  static getPayloadFromToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role || 'USER', // По умолчанию USER если не указано
        exp: payload.exp,
      };
    } catch {
      return null;
    }
  }

  // Проверяем не истек ли токен
  static isTokenExpired(token: string): boolean {
    try {
      const payload = this.getPayloadFromToken(token);
      if (!payload || !payload.exp) return false;

      return payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  // Получаем роль из токена
  static getRoleFromToken(token: string): string | null {
    try {
      const payload = this.getPayloadFromToken(token);
      return payload?.role || null;
    } catch {
      return null;
    }
  }
}
