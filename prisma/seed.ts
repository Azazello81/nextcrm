import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Создаем тестовую запись
  const testConnection = await prisma.testConnection.upsert({
    where: { id: 1 },
    update: {},
    create: {
      message: 'База данных успешно подключена и работает!',
    },
  })

  console.log('✅ Test connection created:', testConnection)
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })