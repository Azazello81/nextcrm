#!/bin/bash
set -e

echo "🚀 Запуск NextCRM..."

# Используем переменные из .env
export PGPASSWORD=${DB_PASSWORD}

# Ожидаем доступности базы данных
echo "⏳ Ожидание PostgreSQL на ${DB_HOST}:${DB_PORT}..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER >/dev/null 2>&1; do
  sleep 2
done

echo "✅ PostgreSQL готов!"

# Применяем Prisma схему
echo "🔧 Применение Prisma схемы..."
npx prisma db push --accept-data-loss

# Инициализируем тестовые данные
echo "🔄 Инициализация тестовых данных..."
npx tsx scripts/init-db.ts

# Запускаем приложение
echo "🎯 Запуск Next.js..."
exec npm run dev