// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Выход выполнен успешно'
  });

  // Очищаем куки
  response.cookies.delete('auth_token');
  
  return response;
}