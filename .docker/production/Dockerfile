FROM node:20-alpine AS builder

# Устанавливаем зависимости для сборки
RUN apk add --no-cache \
    postgresql-client \
    bash \
    curl

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости только для продакшена
RUN npm ci --only=production && npx prisma generate

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Production image
FROM node:20-alpine AS runner

RUN apk add --no-cache \
    postgresql-client \
    bash \
    curl

WORKDIR /app

# Копируем собранное приложение и зависимости
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/prisma ./prisma

# Создаем непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /app
RUN chmod +x /app/scripts/*.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["/app/scripts/docker-entrypoint.sh"]