#!/bin/bash

set -e

echo "🚀 Запуск NextCRM..."

# Ожидаем доступности базы данных
/app/scripts/wait-for-db.sh $DB_HOST $DB_PORT $DB_USER

# Применяем миграции Prisma
echo "🔄 Применение миграций базы данных..."
npx prisma db push --accept-data-loss

# Инициализируем тестовые данные
echo "🔄 Инициализация тестовых данных..."
npx tsx scripts/init-db.ts

# Запускаем приложение
echo "🎯 Запуск Next.js приложения..."
if [ "$NODE_ENV" = "production" ]; then
  exec npm start
else
  exec npm run dev
fi