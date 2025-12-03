# Используем Node.js 22 (Prisma 6.2.1 совместима с Node.js 18+)
FROM node:22.12-slim

# Установка утилит
RUN apt-get update && \
    apt-get install -y postgresql-client tzdata && \
    rm -rf /var/lib/apt/lists/*

# Настройка часового пояса
ENV TZ=Europe/Moscow
RUN ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем зависимости
RUN npm install

# Генерируем Prisma Client
RUN npx prisma generate

# Копируем исходный код
COPY . .

EXPOSE 3000

# Скрипт entrypoint
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]