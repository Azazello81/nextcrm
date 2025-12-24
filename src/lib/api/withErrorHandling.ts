import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from './ApiError';
import { getI18nForRequest } from '../i18n';

type Handler = (...args: any[]) => Promise<NextResponse> | NextResponse;

export function withErrorHandling(handler: Handler) {
  return async (request: NextRequest, context?: any) => {
    const { t } = getI18nForRequest(request as NextRequest);
    try {
      // Handler is expected to return a NextResponse
      return await handler(request, context);
    } catch (error: unknown) {
      console.error('❌ [API] Unhandled error:', error);

      if (error instanceof ApiError) {
        const message = t(error.code, error.meta as Record<string, string | number> | undefined);
        return NextResponse.json({ success: false, message }, { status: error.status });
      }

      // Fallback
      return NextResponse.json({ success: false, message: t('server_error') }, { status: 500 });
    }
  };
}
