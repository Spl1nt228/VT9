# Docker Lab Management Script

Write-Host "=== Docker Lab Management Script ===" -ForegroundColor Green

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "`nAvailable commands:" -ForegroundColor Yellow
    Write-Host "  start   - Start all services (docker-compose up -d)" -ForegroundColor Cyan
    Write-Host "  stop    - Stop all services (docker-compose down)" -ForegroundColor Cyan
    Write-Host "  status  - Show service status" -ForegroundColor Cyan
    Write-Host "  test    - Test API endpoints" -ForegroundColor Cyan
    Write-Host "  clean   - Stop and clean all data" -ForegroundColor Cyan
    Write-Host "  help    - Show this help" -ForegroundColor Cyan
}

Set-Location "c:\Users\taras\source\repos\vt8\docker-lab"

switch ($Command.ToLower()) {
    "start" {
        Write-Host "Starting Docker Compose services..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "`nServices available at:" -ForegroundColor Yellow
        Write-Host "  NestJS App: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  pgAdmin:    http://localhost:8080" -ForegroundColor Cyan
    }
    
    "stop" {
        Write-Host "Stopping Docker Compose services..." -ForegroundColor Yellow
        docker-compose down
    }
    
    "status" {
        Write-Host "Docker Compose services status:" -ForegroundColor Green
        docker-compose ps
    }
    
    "test" {
        Write-Host "Testing API endpoints..." -ForegroundColor Green
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:3000" -TimeoutSec 5
            Write-Host "Main page OK: $response" -ForegroundColor Green
        } catch {
            Write-Host "Main page ERROR: $_" -ForegroundColor Red
        }
        
        try {
            $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
            Write-Host "Health check OK" -ForegroundColor Green
        } catch {
            Write-Host "Health check ERROR: $_" -ForegroundColor Red
        }
    }
    
    "clean" {
        Write-Host "Cleaning up..." -ForegroundColor Red
        docker-compose down -v
        docker rmi docker-lab-app nestjs-simple nestjs-optimized -f
        Write-Host "Cleanup completed." -ForegroundColor Green
    }
    
    default {
        Show-Help
    }
}

Write-Host "`n=== Done ===" -ForegroundColor Green