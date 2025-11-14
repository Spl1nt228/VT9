# Руководство по деплою на Render

## Выполненные задания

### ✅ Задание 1: Подготовка приложения к деплою

**Что сделано:**
- `src/main.ts` — настроено прослушивание порта через `process.env.PORT` с парсингом в integer и fallback на 3000
- `Procfile` — создан с командой `web: node dist/main.js` для запуска продакшн-версии
- `package.json` — присутствуют скрипты:
  - `build`: `nest build` — сборка приложения
  - `start:prod`: `node dist/main` — запуск продакшн-версии

### ✅ Задание 2: Настройка базового CI/CD-пайплайна в GitHub Actions

**Что сделано:**
Файл `.github/workflows/deploy.yml` включает:
- **Checkout кода** — `actions/checkout@v4`
- **Настройка Node.js** — `actions/setup-node@v4` (версия 18)
- **Установка зависимостей** — `npm ci`
- **Генерация Prisma client** — `npx prisma generate`
- **Сборка приложения** — `npm run build`
- **Docker Buildx** — настройка и логин в Docker Hub
- **Сборка и push Docker образа** — из `Dockerfile.optimized` в Docker Hub
- **Деплой на Render** — через Deploy Hook URL

### ✅ Задание 3: Добавление автоматического тестирования в CI/CD

**Что сделано:**
- Добавлен отдельный джоб `test` который запускается перед `build-and-deploy`
- Включает шаг `npm test` с настроенной тестовой БД PostgreSQL
- Джоб `build-and-deploy` зависит от `test` через `needs: test` — если тесты падают, деплой не запустится
- **Почему это критично для CI:**
  - **Раннее обнаружение дефектов** — тесты ловят баги до того, как код попадет в продакшн
  - **Защита от регрессий** — автоматически проверяет, что новые изменения не сломали существующий функционал
  - **Надежность релизов** — гарантирует, что в продакшн попадает только работающий код
  - **Экономия времени** — предотвращает дорогостоящие откаты и исправления в продакшене

---

## Настройка Render

### 1. Создание Web Service на Render

1. Зарегистрируйтесь на [render.com](https://render.com)
2. Создайте новый **Web Service**
3. Подключите ваш GitHub репозиторий
4. Настройте параметры:
   - **Name**: `docker-lab-nestjs` (или любое имя)
   - **Region**: выберите ближайший регион
   - **Branch**: `main`
   - **Runtime**: `Docker`
   - **Docker Build Context Directory**: оставьте пустым (корень репозитория)
   - **Dockerfile Path**: `./Dockerfile.optimized`

### 2. Настройка Environment Variables в Render

В разделе **Environment** добавьте переменные:
```
PORT=10000
DATABASE_URL=postgresql://user:password@hostname:5432/database
JWT_SECRET=your-production-jwt-secret-here
NODE_ENV=production
```

**Важно:** Render автоматически предоставляет порт через `PORT`, убедитесь что значение `10000` (или оставьте пустым — Render подставит автоматически).

### 3. Настройка PostgreSQL на Render

1. В dashboard Render создайте **PostgreSQL** базу данных
2. После создания скопируйте **Internal Database URL**
3. Добавьте его как переменную `DATABASE_URL` в настройках Web Service

### 4. Получение Deploy Hook URL

1. В настройках вашего Web Service на Render найдите раздел **Settings**
2. Прокрутите до **Deploy Hook**
3. Скопируйте URL (формат: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

### 5. Настройка GitHub Secrets

В вашем GitHub репозитории:
1. Перейдите в **Settings** → **Secrets and variables** → **Actions**
2. Добавьте следующие secrets:

```
DOCKER_USERNAME — ваш username на Docker Hub
DOCKER_PASSWORD — пароль или access token Docker Hub
RENDER_DEPLOY_HOOK_URL — URL из пункта 4
```

---

## Проверка работы

### Локальная проверка

#### 1. Установка зависимостей (с чистого листа)
```powershell
cd "C:\Users\taras\source\repos\vt9\docker-lab"

# Закройте VS Code и терминалы, затем:
npm cache clean --force
npx rimraf node_modules
Remove-Item -Force "package-lock.json"

# Переустановка (требуется Node.js >= 20.17.0)
npm ci
npx prisma generate
```

#### 2. Сборка приложения
```powershell
npm run build
```

#### 3. Запуск в продакшн-режиме
```powershell
$env:PORT="3000"
$env:JWT_SECRET="local-secret-key-change-in-production"
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb"

npm run start:prod
```

Откройте браузер: `http://localhost:3000`

#### 4. Проверка через Docker (локально)
```powershell
# Сборка образа
docker build -f Dockerfile.optimized -t your-dockerhub-username/nestjs-app:local .

# Запуск контейнера
docker run -p 3000:3000 `
  -e PORT=3000 `
  -e JWT_SECRET="local-secret" `
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/appdb" `
  your-dockerhub-username/nestjs-app:local
```

Откройте: `http://localhost:3000`

### Проверка CI/CD Pipeline

#### 1. Запуск пайплайна
```powershell
git add .
git commit -m "Configure CI/CD for Render deployment"
git push origin main
```

#### 2. Мониторинг GitHub Actions
1. Перейдите на вкладку **Actions** в вашем репозитории
2. Убедитесь что джоб `test` запущен и выполняется:
   - Checkout кода
   - Setup Node.js
   - Install dependencies
   - Generate Prisma client
   - **Run tests** ← ключевой шаг
   - Build application
3. Если тесты проходят, запускается джоб `build-and-deploy`:
   - Сборка приложения
   - Build и push Docker образа в Docker Hub
   - Deploy на Render (вызов webhook)

#### 3. Проверка Docker Hub
1. Перейдите на [hub.docker.com](https://hub.docker.com)
2. Откройте ваш репозиторий `nestjs-app`
3. Убедитесь что появились теги:
   - `latest`
   - `<commit-sha>` (например, `a1b2c3d4`)

#### 4. Проверка деплоя на Render
1. В dashboard Render откройте ваш Web Service
2. На вкладке **Events** проверьте статус деплоя
3. После успешного деплоя перейдите по URL вашего сервиса:
   ```
   https://your-app-name.onrender.com
   ```
4. Проверьте логи:
   - В Render: вкладка **Logs**
   - Должно быть сообщение: `Application is running on: http://0.0.0.0:10000`

### Проверка остановки пайплайна при падении тестов

#### Тестирование fail-fast механизма:
1. Откройте любой тест (например, `src/app.controller.spec.ts`)
2. Временно сломайте assertion:
   ```typescript
   expect(appController.getHello()).toBe('Wrong Value!');
   ```
3. Закоммитьте и запушьте:
   ```powershell
   git add .
   git commit -m "Test: intentional test failure"
   git push origin main
   ```
4. В GitHub Actions:
   - Джоб `test` упадет с ошибкой ❌
   - Джоб `build-and-deploy` **не запустится** (благодаря `needs: test`)
   - Docker образ не будет собран
   - Деплой на Render не произойдет

5. Верните правильный assertion и запушьте снова

---

## Важные замечания

### Требования к Node.js
Некоторые зависимости требуют Node.js `>= 20.17.0` или `>= 22.9.0`. 

**Установка Node.js 20.17.0 LTS:**
- Скачайте с [nodejs.org](https://nodejs.org)
- Или через nvm-windows:
  ```powershell
  nvm install 20.17.0
  nvm use 20.17.0
  node -v
  ```

### Проблемы с EBUSY в Windows
Если при `npm ci` возникает ошибка `EBUSY: resource busy or locked`:
1. Закройте все терминалы и VS Code
2. Завершите все процессы Node:
   ```powershell
   taskkill /F /IM node.exe
   ```
3. Удалите папку:
   ```powershell
   npx rimraf node_modules
   ```
4. Повторите `npm ci`

### Миграции БД на Render
При первом деплое выполните миграции:
1. В Render Shell (доступен в dashboard) или локально с продакшн DATABASE_URL:
   ```bash
   npx prisma migrate deploy
   ```

### Мониторинг здоровья приложения
Render автоматически проверяет доступность на корневом эндпоинте. Убедитесь что `GET /` отвечает успешно.

---

## Архитектура CI/CD

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Push to main                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  JOB: test                                                  │
│  ├─ Checkout code                                           │
│  ├─ Setup Node.js 18                                        │
│  ├─ npm ci (install dependencies)                           │
│  ├─ npx prisma generate                                     │
│  ├─ npm test ⚠️ CRITICAL GATE                              │
│  └─ npm run build                                           │
└────────────────────┬────────────────────────────────────────┘
                     │ Success? ✅
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  JOB: build-and-deploy (needs: test)                        │
│  ├─ Checkout code                                           │
│  ├─ Setup Node.js 18                                        │
│  ├─ npm ci                                                  │
│  ├─ npm run build                                           │
│  ├─ Docker Buildx setup                                     │
│  ├─ Login to Docker Hub                                     │
│  ├─ Build & Push Docker image (Dockerfile.optimized)        │
│  └─ Deploy to Render (webhook)                              │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Render pulls Docker image from Docker Hub                  │
│  Starts container with environment variables                │
│  Application available at https://your-app.onrender.com     │
└─────────────────────────────────────────────────────────────┘
```

---

## Контрольный список выполнения задания

### ✅ Задание 1: Подготовка приложения к деплою
- [x] `src/main.ts` слушает `process.env.PORT` (с fallback 3000)
- [x] `Procfile` создан с командой `web: node dist/main.js`
- [x] `package.json` содержит `build` и `start:prod` скрипты

### ✅ Задание 2: Настройка базового CI/CD-пайплайна
- [x] Файл `.github/workflows/deploy.yml` создан
- [x] Workflow запускается при push в `main`
- [x] Шаги включают:
  - [x] `actions/checkout` — получение кода
  - [x] `actions/setup-node` — настройка Node.js
  - [x] `npm ci` — установка зависимостей
  - [x] `npm run build` — сборка приложения
  - [x] Docker build из `Dockerfile.optimized`
  - [x] Push в Docker Hub
  - [x] Deploy на Render

### ✅ Задание 3: Добавление автоматического тестирования
- [x] Шаг `npm test` добавлен после установки зависимостей
- [x] Тесты запускаются **до** сборки приложения
- [x] Пайплайн останавливается если тесты не прошли (`needs: test`)
- [x] Объяснено почему это критично для CI (см. выше)

---

## Дополнительные ресурсы

- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub](https://hub.docker.com)
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-render)
