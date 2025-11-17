#!/bin/bash

echo "=========================================="
echo "  Starting Madlen Chat Application"
echo "=========================================="

# 1. Start Jaeger
echo "[1/3] Starting Jaeger..."
docker-compose up -d

# Function to open a new terminal window
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
        # Fallback: Run in background
        echo "No external terminal found. Running $title in background..."
        eval "$cmd &"
    fi
}

# 2. Start Backend
echo "[2/3] Launching Backend..."
# Note: Assumes 'source venv/bin/activate' works relative to backend folder
open_terminal "Madlen Backend" "cd backend && source venv/bin/activate && uvicorn app.main:app --reload"

# 3. Start Frontend
echo "[3/3] Launching Frontend..."
open_terminal "Madlen Frontend" "cd frontend && npm start"

echo ""
echo "Services are starting..."
echo "Jaeger UI: http://localhost:16686"