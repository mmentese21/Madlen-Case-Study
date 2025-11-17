@echo off
setlocal
title Madlen Chat - Setup & Run

echo ===================================================
echo   Madlen Chat Application - Auto Setup & Run
echo ===================================================

:: --- STEP 1: DOCKER & JAEGER ---
echo.
echo [1/4] Checking Docker and Jaeger...
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is NOT running. Please start Docker Desktop and try again.
    pause
    exit /b
)

echo Starting Jaeger container...
docker-compose up -d
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to start Jaeger. Check docker-compose.yml.
    pause
    exit /b
)

:: --- STEP 2: BACKEND SETUP ---
echo.
echo [2/4] Setting up Backend (FastAPI)...
cd backend

IF NOT EXIST "venv" (
    echo    - Creating Python virtual environment...
    python -m venv venv
)

echo    - Activating virtual environment...
call venv\Scripts\activate

echo    - Installing/Updating dependencies...
pip install -q -r requirements.txt

IF NOT EXIST ".env" (
    echo    - WARNING: .env file not found! 
    echo    - Creating a template .env file...
    echo OPENROUTER_API_KEY="replace_with_your_key" > .env
    echo    - Please edit backend/.env with your real API Key.
)

cd ..

:: --- STEP 3: FRONTEND SETUP ---
echo.
echo [3/4] Setting up Frontend (React)...
cd frontend

IF NOT EXIST "node_modules" (
    echo    - Installing Node dependencies (this may take a minute)...
    call npm install
) ELSE (
    echo    - Node modules found, skipping install.
)

cd ..

:: --- STEP 4: LAUNCH SERVICES ---
echo.
echo [4/4] Launching Services...

:: Start Backend in a new window
start "Madlen Backend" cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload"

:: Start Frontend in a new window
start "Madlen Frontend" cmd /k "cd frontend && npm start"

echo.
echo ===================================================
echo   All systems go!
echo   Backend API: http://localhost:8000/docs
echo   Frontend UI: http://localhost:3000
echo   Jaeger UI:   http://localhost:16686
echo ===================================================
pause