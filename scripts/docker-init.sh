#!/bin/bash
set -e

echo "🚀 Запуск NextCRM в Docker..."

# Используем переменные из docker-compose
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${POSTGRES_DB:-db_crm_dev}"

# Ждем PostgreSQL
echo "⏳ Ожидание PostgreSQL..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  sleep 2
done

echo "✅ PostgreSQL готов!"

# Применяем Prisma схему
echo "🔧 Применение Prisma схемы..."
npx prisma db push --accept-data-loss

# Запускаем приложение
echo "🎯 Запуск Next.js..."
exec npm run dev