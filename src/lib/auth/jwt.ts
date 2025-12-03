// src/lib/auth/jwt.ts
import 'dotenv/config';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export class JWTService {
  // Секреты только на сервере
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;

  static generateAccessToken(payload: JWTPayload): string {
    if (!this.ACCESS_TOKEN_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }

  static verifyAccessToken(token: string): JWTPayload {
    if (!this.ACCESS_TOKEN_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
  }

  static generateRefreshToken(payload: JWTPayload): string {
    if (!this.REFRESH_TOKEN_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  }

  static verifyRefreshToken(token: string): JWTPayload {
    if (!this.REFRESH_TOKEN_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JWTPayload;
  }

   // Новый метод для декодирования токена без проверки подписи
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }
}
