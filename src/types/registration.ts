export interface CleanupResult {
  deletedSuccessful: number; // Подтвержденные >1 дня
  deletedExpired: number; // Истекшие сессии
  deletedOld: number; // Все >1 недели
  deletedOrphaned?: number; // Orphaned сессии (опционально)
}

export interface CleanupStats {
  successfulToDelete: number;
  expiredToDelete: number;
  oldToDelete: number;
  orphanedToDelete: number;
  totalSessions: number;
  timestamp: string;
}

export interface SessionStats {
  totalSessions: number;
  verifiedSessions: number;
  blockedSessions: number;
  expiredSessions: number;
  sessionsToday: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

export interface RegistrationSessionData {
  id: string;
  email: string;
  attempts: number;
  isVerified: boolean;
  verificationCodeExpires: Date;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
}

export interface RegistrationSessionDetails extends RegistrationSessionData {
  user?: {
    id: string;
    email: string;
    role: string;
    registeredAt: Date | null;
    lastLoginAt: Date | null;
  } | null;
}
