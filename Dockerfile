# Задание 1: Простой Dockerfile
# Базовый образ Node.js
FROM node:20-alpine

# Установка рабочей директории
WORKDIR /usr/src/app

# Копирование файлов зависимостей
COPY package*.json ./

COPY prisma ./prisma
# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Генерация Prisma клиента
RUN npx prisma generate

# Сборка приложения
RUN npm run build

# Открытие порта
EXPOSE 3000

# Запуск приложения
CMD ["npm", "run", "start:prod"]