import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🔄 Инициализация базы данных...');

    // Создаем тестовую таблицу через Prisma
    const testRecord = await prisma.testConnection.upsert({
      where: { id: 1 },
      update: {},
      create: {
        message: 'База данных успешно подключена и работает!',
      },
    });

    console.log('✅ База данных инициализирована');
    console.log('📊 Тестовая запись:', testRecord);
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
