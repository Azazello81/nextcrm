#!/bin/bash

# Ожидание доступности PostgreSQL
echo "🕐 Ожидание запуска PostgreSQL на $1:$2..."

while ! pg_isready -h $1 -p $2 -U $3; do
  echo "⏳ PostgreSQL не доступен, ждем..."
  sleep 2
done

echo "✅ PostgreSQL запущен и доступен!"