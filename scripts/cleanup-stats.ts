// scripts/cleanup-stats.ts
import { RegistrationService } from '../src/services/auth/registration.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showCleanupStats() {
  console.log('📊 СТАТИСТИКА СЕССИЙ РЕГИСТРАЦИИ');
  console.log('='.repeat(50));
  
  try {
    const stats = await RegistrationService.getCleanupStats();
    
    console.log('📈 БУДУТ УДАЛЕНЫ ПРИ СЛЕДУЮЩЕЙ ОЧИСТКЕ:');
    console.log(`   Подтвержденные (>1 дня): ${stats.successfulToDelete}`);
    console.log(`   Истекшие сессии: ${stats.expiredToDelete}`);
    console.log(`   Старые (>1 недели): ${stats.oldToDelete}`);
    console.log(`   Orphaned сессии: ${stats.orphanedToDelete}`);
    console.log(`   ВСЕГО К УДАЛЕНИЮ: ${stats.successfulToDelete + stats.expiredToDelete + stats.oldToDelete + stats.orphanedToDelete}`);
    
    console.log('\n📁 ОБЩАЯ СТАТИСТИКА:');
    console.log(`   Всего сессий в БД: ${stats.totalSessions}`);
    console.log(`   Время проверки: ${stats.timestamp}`);
    
    // Дополнительная детальная статистика
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentSessions = await prisma.registrationSession.count({
      where: {
        createdAt: { gte: oneHourAgo }
      }
    });
    
    const activeSessions = await prisma.registrationSession.count({
      where: {
        verificationCodeExpires: { gt: now },
        isVerified: false
      }
    });
    
    console.log(`\n🎯 ДЕТАЛЬНАЯ СТАТИСТИКА:`);
    console.log(`   Сессий за последний час: ${recentSessions}`);
    console.log(`   Активных сессий (не истекших): ${activeSessions}`);
    console.log(`   Процент к очистке: ${Math.round(((stats.successfulToDelete + stats.expiredToDelete + stats.oldToDelete + stats.orphanedToDelete) / stats.totalSessions) * 100)}%`);
    
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  showCleanupStats();
}