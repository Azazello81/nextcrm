// src/app/api/maintenance/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const message = process.env.MAINTENANCE_MESSAGE || '';
  const estimatedTime = process.env.MAINTENANCE_ESTIMATED_TIME || '';
  const contactEmail = process.env.MAINTENANCE_CONTACT_EMAIL || '';
  
  const response = NextResponse.json({
    maintenance: maintenanceMode,
    message,
    estimatedTime,
    contactEmail,
    timestamp: new Date().toISOString(),
    retryAfter: process.env.MAINTENANCE_RETRY_AFTER || '3600',
  });
  
  if (maintenanceMode) {
    // Устанавливаем правильные заголовки для техработ
    response.headers.set('Retry-After', process.env.MAINTENANCE_RETRY_AFTER || '3600');
    response.headers.set('X-Maintenance-Mode', 'true');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  
  return response;
}

export async function POST(request: NextRequest) {
  // Этот endpoint может использоваться администраторами для управления техработами
  try {
    const authHeader = request.headers.get('authorization');
    const isAdmin = authHeader === `Bearer ${process.env.ADMIN_API_KEY}`;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action } = body;
    
    // Здесь можно добавить логику для динамического управления техработами
    // Например, запись в базу данных или файл конфигурации
    
    return NextResponse.json({
      success: true,
      message: `Maintenance ${action}d successfully`,
      action,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}