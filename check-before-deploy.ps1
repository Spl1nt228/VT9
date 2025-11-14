# Скрипт для локальной проверки перед деплоем

Write-Host "=== Локальная проверка приложения ===" -ForegroundColor Green

# Проверка зависимостей
Write-Host "1. Проверка зависимостей..." -ForegroundColor Yellow
npm audit

# Запуск линтера
Write-Host "2. Запуск линтера..." -ForegroundColor Yellow
npm run lint

# Запуск тестов
Write-Host "3. Запуск тестов..." -ForegroundColor Yellow
npm test

# Сборка приложения
Write-Host "4. Сборка приложения..." -ForegroundColor Yellow
npm run build

# Проверка сборки Docker образа
Write-Host "5. Сборка Docker образа..." -ForegroundColor Yellow
docker build -f Dockerfile.optimized -t nestjs-app:test .

# Проверка размера образа
Write-Host "6. Информация об образе:" -ForegroundColor Yellow
docker images nestjs-app:test

# Очистка тестового образа
Write-Host "7. Очистка..." -ForegroundColor Yellow
docker rmi nestjs-app:test

Write-Host "=== Проверка завершена ===" -ForegroundColor Green
Write-Host "Если все прошло успешно, можно делать push в репозиторий!" -ForegroundColor Cyan