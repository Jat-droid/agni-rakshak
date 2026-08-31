# AGNI-RAKSHAK — Enterprise Multi-Modal Wildfire & Crop Defense System

AGNI-RAKSHAK is a 3-tier distributed edge-intelligence system designed for real-time fire detection, cadastral risk mapping, and autonomous emergency actuation.

```
[ CCTV / Drone / RTSP Stream ]
              │
              ▼
   [ python-ai ] (YOLOv8 Edge Engine + Spatio-Temporal Fourier Fusion)
              │  HTTP POST /api/ingest/*
              ▼
   [ dotnet-backend ] (ASP.NET Core 8 Web API + SignalR + SQLite)
              │  REST /api/* & WebSockets /hubs/fire
              ▼
   [ react-frontend ] (Vite + React Dashboard served by Nginx)
```

---

## 🚀 Quick Deployment with Docker Compose (Production Ready)

### 1. Configure Environment (Optional)
Copy the template and set your RTSP IP Camera stream and Telegram credentials:
```bash
cp .env.example .env
```

### 2. Build & Launch Containers
```bash
docker compose up --build -d
```

* **Dashboard Web UI**: `http://localhost` (or your server's IP address)
* **Backend API & SignalR Hub**: `http://localhost:5080`
* **Real-time MJPEG Stream**: `http://localhost/api/video_feed`

To view container logs:
```bash
docker compose logs -f
```

To stop:
```bash
docker compose down
```

---

## 🛠️ Local Development Setup (Run Without Docker)

### 1. ASP.NET Core Backend
```bash
cd dotnet-backend
dotnet run
# -> listening on http://localhost:5080
```

### 2. React + Vite Frontend
```bash
cd react-frontend
npm install
npm run dev
# -> listening on http://localhost:5173 (proxies /api to http://localhost:5080)
```

### 3. Python AI Worker (OpenCV + YOLOv8)
```bash
cd python-ai
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python fire_detector.py
```

---

## 🎥 Camera / Video Stream Configuration

In `python-ai/.env` (or via environment variables):
* **Local USB/Built-in Webcam**: `VIDEO_SOURCE=0`
* **CCTV / RTSP IP Camera**: `VIDEO_SOURCE=rtsp://admin:password@192.168.1.100:554/stream`
* **Video File Benchmark**: `VIDEO_SOURCE=test_wildfire.mp4`

---

## 🔒 Security & Data Persistence
* **SQLite Database**: `agnirakshak.db` contains seeded farmer cadastral profiles and forensic incident logs. In Docker, it is automatically mounted to a persistent volume `backend-sqlite-data`.
* **CORS**: ASP.NET Core is pre-configured to support local development and reverse-proxied production environments.
