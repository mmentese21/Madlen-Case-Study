# Madlen Chat Application

A local web-based chat interface that serves as a gateway to various AI models via OpenRouter. This project demonstrates a full-stack integration using modern technologies, real-time API interactions, and distributed tracing.

## 🚀 Project Overview

This application allows users to:
- **Select AI Models**: Choose from available free models provided by OpenRouter.
- **Chat**: Send messages and receive responses in a real-time interface.
- **View History**: See the conversation flow within the current session.
- **Monitor**: Track system performance and API calls via OpenTelemetry and Jaeger.

## 🛠️ Technical Choices & Rationale

### Backend: **FastAPI (Python)**
- **Why:** Chosen for its high performance and native support for asynchronous programming (`async/await`). This is crucial for handling external API calls (OpenRouter) without blocking the server. It also automatically generates OpenAPI documentation.

### Frontend: **React + TypeScript**
- **Why:** React provides a responsive, component-based architecture perfect for chat UIs. TypeScript was selected to ensure type safety, reducing runtime errors and improving code maintainability compared to standard JavaScript.

### Telemetry: **OpenTelemetry + Jaeger**
- **Why:** To meet the observability requirement, OpenTelemetry is used to instrument the application. Jaeger (running via Docker) was chosen as the backend to visualize these traces because it is the industry standard for distributed tracing and integrates seamlessly with OpenTelemetry.

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- **Python 3.8+**
- **Node.js & npm**
- **Docker Desktop** (Must be running for Jaeger)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository_url>
cd Madlen\ Case\ Study
```

### 2. Backend Setup

Navigate to the backend folder and set up the Python environment.

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```
🔑 API Key Configuration: Create a file named .env inside the backend/ directory to securely manage your key.

OPENROUTER_API_KEY="your_openrouter_key_here"

### 3. Frontend Setup

Navigate to the frontend folder and install Node dependencies.

```bash
cd ../frontend
npm install
```

### 4. Telemetry Infrastucture

Start the Jaeger container using Docker Compose. Ensure Docker Desktop is running first.

```bash
cd ..
docker-compose up -d
```


## Running the Application

### Option A: Automaded Scripts

Use the included scripts to launch all services in separate windows.

Windows: Double-click run_project.bat.

Mac/Linux: Run ./run_project.sh.

### Option B: Manual Start

If you prefer running services manually, open two separate terminals:

Terminal 1: Backend


```bash
cd backend
# Ensure venv is active
uvicorn app.main:app --reload
Server runs at: http://localhost:8000
```

Terminal 2: Frontend

```bash
cd frontend
npm start
```

Client runs at: http://localhost:3000