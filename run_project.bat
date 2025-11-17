@echo off
echo ==========================================
echo   Starting Madlen Chat Application
echo ==========================================

:: 1. Start Jaeger Container
echo [1/3] Starting Jaeger Container...
docker-compose up -d
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not running or failed to start Jaeger.
    pause
    exit /b
)

:: 2. Start Backend in a new window
echo [2/3] Starting FastAPI Backend...
start "Madlen Backend" cmd /k "cd backend && venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload"

:: 3. Start Frontend in a new window
echo [3/3] Starting React Frontend...
start "Madlen Frontend" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo   All services launched!
echo   Backend: http://localhost:8000/docs
echo   Frontend: http://localhost:3000
echo   Jaeger: http://localhost:16686
echo ==========================================
pause