import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const startTime = Date.now();

    // Простая проверка соединения
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'healthy',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      versions: {
        node: process.version,
        prisma: '6.2.1'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 503 }
    );
  }
}