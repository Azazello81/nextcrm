import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService } from '../../../../services/auth/registration.service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email обязателен' }, { status: 400 });
    }

    const result = await RegistrationService.resendVerificationCode(email);

    return NextResponse.json({
      success: true,
      message: 'Новый код подтверждения отправлен',
      sessionId: result.sessionId,
      ...(process.env.NODE_ENV === 'development' && {
        verificationCode: result.verificationCode,
      }),
    });
  } catch (error) {
    console.error('❌ [Resend Code API] Ошибка:', error);
    const message =
      error instanceof Error ? error.message : 'Не удалось повторно отправить код подтверждения';

    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
