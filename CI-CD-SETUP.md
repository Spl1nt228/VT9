# CI/CD Setup Instructions

## Настройка GitHub Secrets

Для работы CI/CD пайплайна необходимо настроить следующие секреты в вашем GitHub репозитории:

### Перейдите в Settings → Secrets and variables → Actions и добавьте:

1. **DOCKER_USERNAME** - ваш логин Docker Hub
2. **DOCKER_PASSWORD** - ваш пароль Docker Hub (или токен доступа)
3. **HEROKU_API_KEY** - ваш API ключ Heroku
4. **HEROKU_APP_NAME** - имя вашего приложения в Heroku
5. **HEROKU_EMAIL** - ваш email, связанный с аккаунтом Heroku

## Получение Heroku API Key

1. Войдите в свой аккаунт Heroku
2. Перейдите в Account Settings
3. Найдите секцию "API Key"
4. Скопируйте ключ или сгенерируйте новый

## Создание приложения в Heroku

```bash
# Установите Heroku CLI
# Войдите в аккаунт
heroku login

# Создайте новое приложение
heroku create your-app-name

# Добавьте PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Установите переменные окружения
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

## Настройка Docker Hub

1. Зарегистрируйтесь на https://hub.docker.com
2. Создайте репозиторий для вашего приложения
3. Обновите в `.github/workflows/deploy.yml` строку с именем образа:
   ```yaml
   tags: |
     your-username/your-app-name:latest
     your-username/your-app-name:${{ github.sha }}
   ```

## Структура пайплайна

### Тестирование (Job: test)
- Запускается для всех push и pull request
- Устанавливает PostgreSQL для тестов
- Выполняет `npm test`
- Проверяет сборку приложения

### Сборка и деплой (Job: build-and-deploy)
- Запускается только для ветки main после успешных тестов
- Собирает Docker образ
- Отправляет образ в Docker Hub
- Деплоит на Heroku

## Важные особенности

1. **Автоматические тесты**: Пайплайн останавливается, если тесты не прошли
2. **Кеширование**: Использует кеш для ускорения сборки
3. **Безопасность**: Все секретные данные хранятся в GitHub Secrets
4. **Multi-stage build**: Использует оптимизированный Dockerfile

## Методология CI (Continuous Integration)

Шаг тестирования критически важен, так как:
- **Раннее обнаружение ошибок**: Тесты выявляют проблемы до попадания кода в продакшн
- **Качество кода**: Гарантирует, что новые изменения не ломают существующую функциональность
- **Автоматизация**: Исключает человеческий фактор при проверке кода
- **Быстрая обратная связь**: Разработчики сразу узнают о проблемах
- **Надежность деплоя**: Только проверенный код попадает в продакшн

## Локальная проверка

Перед push в репозиторий рекомендуется выполнить:

```bash
# Запуск тестов
npm test

# Проверка сборки
npm run build

# Запуск линтера
npm run lint

# Сборка Docker образа
docker build -f Dockerfile.optimized -t my-app .
```