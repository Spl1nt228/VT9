# Скрипт для управления Docker Lab проектом

Write-Host "=== Docker Lab Management Script ===" -ForegroundColor Green

# Функция показа доступных команд
function Show-Help {
    Write-Host "`nДоступные команды:" -ForegroundColor Yellow
    Write-Host "  start   - Запустить все сервисы (docker-compose up -d)" -ForegroundColor Cyan
    Write-Host "  stop    - Остановить все сервисы (docker-compose down)" -ForegroundColor Cyan
    Write-Host "  restart - Перезапустить все сервисы" -ForegroundColor Cyan
    Write-Host "  logs    - Показать логи всех сервисов" -ForegroundColor Cyan
    Write-Host "  status  - Показать статус сервисов" -ForegroundColor Cyan
    Write-Host "  build   - Пересобрать образы" -ForegroundColor Cyan
    Write-Host "  clean   - Остановить и очистить все данные" -ForegroundColor Cyan
    Write-Host "  test    - Протестировать API endpoints" -ForegroundColor Cyan
    Write-Host "  help    - Показать эту справку" -ForegroundColor Cyan
}

# Получаем команду из параметров
param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Переходим в директорию проекта
$projectPath = "c:\Users\taras\source\repos\vt8\docker-lab"
Set-Location $projectPath

switch ($Command.ToLower()) {
    "start" {
        Write-Host "Запускаю Docker Compose сервисы..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "`nСервисы доступны по адресам:" -ForegroundColor Yellow
        Write-Host "  NestJS App: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  pgAdmin:    http://localhost:8080 (admin@example.com / admin123)" -ForegroundColor Cyan
        Write-Host "  PostgreSQL: localhost:5432 (nestjs / password123)" -ForegroundColor Cyan
    }
    
    "stop" {
        Write-Host "Останавливаю Docker Compose сервисы..." -ForegroundColor Yellow
        docker-compose down
    }
    
    "restart" {
        Write-Host "Перезапускаю Docker Compose сервисы..." -ForegroundColor Yellow
        docker-compose restart
    }
    
    "logs" {
        Write-Host "Показываю логи всех сервисов..." -ForegroundColor Green
        docker-compose logs -f
    }
    
    "status" {
        Write-Host "Статус Docker Compose сервисов:" -ForegroundColor Green
        docker-compose ps
        Write-Host "`nОбразы Docker:" -ForegroundColor Green
        docker images | Select-String "nestjs|docker-lab"
    }
    
    "build" {
        Write-Host "Пересобираю образы..." -ForegroundColor Green
        docker-compose build --no-cache
        docker-compose up -d
    }
    
    "clean" {
        Write-Host "Останавливаю и очищаю все данные..." -ForegroundColor Red
        docker-compose down -v
        docker rmi docker-lab-app nestjs-simple nestjs-optimized -f
        Write-Host "Очистка завершена." -ForegroundColor Green
    }
    
    "test" {
        Write-Host "Тестирую API endpoints..." -ForegroundColor Green
        
        Write-Host "`nТестирую главную страницу:" -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000" -TimeoutSec 5
            Write-Host "✓ Главная страница: $response" -ForegroundColor Green
        } catch {
            Write-Host "✗ Ошибка: $_" -ForegroundColor Red
        }
        
        Write-Host "`nТестирую health endpoint:" -ForegroundColor Yellow
        try {
            $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
            Write-Host "✓ Health check: $($healthResponse | ConvertTo-Json -Compress)" -ForegroundColor Green
        } catch {
            Write-Host "✗ Ошибка: $_" -ForegroundColor Red
        }
        
        Write-Host "`nТестирую подключение к базе данных:" -ForegroundColor Yellow
        try {
            $dbCheck = docker exec docker-lab-db-1 psql -U nestjs -d nestjs_db -c "SELECT COUNT(*) FROM users;" 2>$null
            if ($dbCheck) {
                Write-Host "✓ База данных доступна" -ForegroundColor Green
            }
        } catch {
            Write-Host "✗ База данных недоступна" -ForegroundColor Red
        }
    }
    }
    
    default {
        Show-Help
    }
}

Write-Host "`n=== Complete ===" -ForegroundColor Green