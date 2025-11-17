#!/bin/bash

echo "==================================================="
echo "  Madlen Chat Application - Auto Setup & Run"
echo "==================================================="

# --- STEP 1: DOCKER & JAEGER ---
echo ""
echo "[1/4] Checking Docker..."
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is NOT running. Please start Docker Desktop."
  exit 1
fi

echo "Starting Jaeger container..."
docker-compose up -d

# --- STEP 2: BACKEND SETUP ---
echo ""
echo "[2/4] Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
  echo "   - Creating Python virtual environment..."
  python3 -m venv venv
fi

echo "   - Activating virtual environment..."
source venv/bin/activate

echo "   - Installing dependencies..."
pip install -r requirements.txt

if [ ! -f ".env" ]; then
  echo "OPENROUTER_API_KEY='replace_with_your_key'" > .env
  echo "   - Created template .env file. Please add your API Key!"
fi

cd ..

# --- STEP 3: FRONTEND SETUP ---
echo ""
echo "[3/4] Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "   - Installing Node dependencies (this may take a minute)..."
  npm install
else
  echo "   - Node modules found, skipping install."
fi

cd ..

# --- STEP 4: LAUNCH SERVICES ---
echo ""
echo "[4/4] Launching Services..."

# Function to open terminal windows based on OS
open_terminal() {
    local title="$1"
    local cmd="$2"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && $cmd\""
    elif command -v gnome-terminal &> /dev/null; then
        # Linux (GNOME)
        gnome-terminal --title="$title" -- bash -c "cd $(pwd); $cmd; exec bash"
    else
        # Fallback
        echo "No external terminal found. Running $title in background..."
        eval "$cmd &"
    fi
}

# Start Backend
open_terminal "Madlen Backend" "cd backend && source venv/bin/activate && uvicorn app.main:app --reload"

# Start Frontend
open_terminal "Madlen Frontend" "cd frontend && npm start"

echo "Services are launching..."
echo "Jaeger UI available at http://localhost:16686"