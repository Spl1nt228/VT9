# Docker Lab - NestJS Application

Проект для демонстрации различных подходов к контейнеризации NestJS приложений с помощью Docker.

## Структура проекта

```
docker-lab/
├── src/                    # Исходный код NestJS приложения
│   ├── main.ts            # Точка входа
│   ├── app.module.ts      # Главный модуль
│   └── app.controller.ts  # Основной контроллер
├── Dockerfile             # Задание 1: Простой Dockerfile
├── Dockerfile.optimized   # Задание 2: Оптимизированный multi-stage
├── docker-compose.yml     # Задание 3: Docker Compose с PostgreSQL
├── init-db.sql           # SQL скрипт для инициализации БД
├── .dockerignore         # Файлы для исключения из Docker контекста
├── .env.example          # Пример переменных окружения
└── package.json          # Зависимости Node.js
```

## Задания

### Задание 1: Простой Dockerfile

Базовый Dockerfile для контейнеризации NestJS приложения:

```bash
# Сборка образа
docker build -t nestjs-simple .

# Запуск контейнера
docker run -p 3000:3000 nestjs-simple

# Проверка работы
curl http://localhost:3000
curl http://localhost:3000/health
```

### Задание 2: Оптимизированный Dockerfile с multi-stage build

Оптимизированный Dockerfile с использованием многоэтапной сборки:

```bash
# Сборка оптимизированного образа
docker build -f Dockerfile.optimized -t nestjs-optimized .

# Запуск контейнера
docker run -p 3000:3000 nestjs-optimized

# Сравнение размеров образов
docker images | grep nestjs
```

**Преимущества multi-stage build:**
- Меньший размер финального образа
- Исключение dev зависимостей из production образа
- Улучшенная безопасность (отдельный пользователь)
- Добавлена проверка здоровья (healthcheck)

### Задание 3: Docker Compose с PostgreSQL

Полная среда разработки с NestJS приложением и PostgreSQL:

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

**Доступные сервисы:**
- NestJS приложение: http://localhost:3000
- pgAdmin: http://localhost:8080 (admin@example.com / admin123)
- PostgreSQL: localhost:5432

### Полезные команды

```bash
# Просмотр запущенных контейнеров
docker ps

# Подключение к контейнеру
docker exec -it <container_name> sh

# Просмотр логов
docker logs <container_name>

# Очистка неиспользуемых образов
docker system prune

# Просмотр использования ресурсов
docker stats
```

## API Endpoints

- `GET /` - Приветственное сообщение
- `GET /health` - Проверка здоровья приложения

## Переменные окружения

Скопируйте `.env.example` в `.env` и настройте необходимые переменные:

```bash
cp .env.example .env
```

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run start:dev

# Сборка приложения
npm run build

# Запуск production версии
npm run start:prod
```

## Troubleshooting

### Проблема с подключением к базе данных

1. Убедитесь, что PostgreSQL контейнер запущен: `docker-compose ps`
2. Проверьте логи базы данных: `docker-compose logs db`
3. Проверьте переменные окружения в docker-compose.yml

### Приложение не отвечает

1. Проверьте статус контейнера: `docker ps`
2. Посмотрите логи приложения: `docker-compose logs app`
3. Убедитесь, что порт 3000 не занят другим процессом

### Ошибки сборки

1. Очистите Docker кеш: `docker system prune -a`
2. Пересоберите образ: `docker-compose build --no-cache`
3. Проверьте, что все файлы присутствуют в контексте сборки