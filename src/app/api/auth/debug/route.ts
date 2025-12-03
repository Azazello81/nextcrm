
import { NextResponse } from 'next/server';
import { UserService } from '../../../../services/auth/user.service';

export async function GET() {
  const isConnected = await UserService.checkConnection();
  
  return NextResponse.json({
    databaseConnected: isConnected,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL
  });
}