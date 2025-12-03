// scripts/cleanup-sessions.ts
import { RegistrationService } from '../src/services/auth/registration.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupRegistrationSessions() {
  console.log('='.repeat(60));
  console.log('🚀 НАЧАЛО ОЧИСТКИ СЕССИЙ РЕГИСТРАЦИИ');
  console.log('📅 Время запуска:', new Date().toISOString());
  console.log('='.repeat(60));
  
  try {
    // 1. Получаем статистику ДО очистки
    console.log('📊 Получение статистики перед очисткой...');
    const statsBefore = await RegistrationService.getCleanupStats();
    
    console.log('\n📈 СТАТИСТИКА ПЕРЕД ОЧИСТКОЙ:');
    console.log(`   Всего сессий в БД: ${statsBefore.totalSessions}`);
    console.log(`   Подтвержденных (>1 дня): ${statsBefore.successfulToDelete}`);
    console.log(`   Истекших сессий: ${statsBefore.expiredToDelete}`);
    console.log(`   Старых (>1 недели): ${statsBefore.oldToDelete}`);
    console.log(`   Orphaned сессий: ${statsBefore.orphanedToDelete}`);
    
    // 2. Выполняем очистку
    console.log('\n🧹 ВЫПОЛНЕНИЕ ОЧИСТКИ...');
    const result = await RegistrationService.cleanupOldSessions();
    
    // 3. Получаем статистику ПОСЛЕ очистки
    console.log('\n📊 Получение статистики после очистки...');
    const statsAfter = await RegistrationService.getCleanupStats();
    
    console.log('\n✅ ОЧИСТКА ЗАВЕРШЕНА УСПЕШНО!');
    console.log('='.repeat(60));
    console.log('📊 РЕЗУЛЬТАТЫ ОЧИСТКИ:');
    console.log(`   Удалено подтвержденных сессий (>1 дня): ${result.deletedSuccessful}`);
    console.log(`   Удалено истекших сессий: ${result.deletedExpired}`);
    console.log(`   Удалено старых сессий (>1 недели): ${result.deletedOld}`);
    console.log(`   Удалено orphaned сессий: ${result.deletedOrphaned || 0}`);
    console.log(`   ВСЕГО УДАЛЕНО: ${result.deletedSuccessful + result.deletedExpired + result.deletedOld + (result.deletedOrphaned || 0)}`);
    
    console.log('\n📈 СТАТИСТИКА ПОСЛЕ ОЧИСТКИ:');
    console.log(`   Осталось сессий в БД: ${statsAfter.totalSessions}`);
    console.log(`   Сокращение: ${statsBefore.totalSessions - statsAfter.totalSessions} сессий`);
    
    console.log('\n⏱️  Время выполнения:', new Date().toISOString());
    console.log('='.repeat(60));
    
    // 4. Закрываем подключение к БД
    await prisma.$disconnect();
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ОШИБКА ОЧИСТКИ:');
    console.error(error);
    
    // Закрываем подключение даже при ошибке
    await prisma.$disconnect().catch(() => {});
    
    process.exit(1);
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  cleanupRegistrationSessions();
}

export { cleanupRegistrationSessions };