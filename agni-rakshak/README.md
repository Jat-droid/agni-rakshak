# AGNI-RAKSHAK — React + .NET + Python (OpenCV) edition

The single Flask+HTML app is split into three independent services:

```
python-ai/        OpenCV detection worker — reads the camera, scores frames
                   for fire/smoke, pushes results to the .NET API.
dotnet-backend/    ASP.NET Core Web API — receives data from python-ai,
                   exposes REST endpoints + an MJPEG stream for the UI.
react-frontend/    Vite + React dashboard — same look as the original HTML,
                   now data-driven by the .NET API.
```

## Data flow

```
[OpenCV worker] --POST status/frame--> [.NET API] <--GET /api/*-- [React app]
   fire_detector.py        api/ingest/*      api/status, /api/video_feed, ...
```

The Python script never talks to the browser directly — everything goes
through the .NET backend, which is the single source of truth (`FireState`).

## Run it

**1. Backend (.NET 8)**
```bash
cd dotnet-backend
dotnet run
# -> listening on http://localhost:5080
```

**2. AI worker (Python)**
```bash
cd python-ai
pip install -r requirements.txt
python fire_detector.py
# Uses webcam 0 by default. Point it at a video file/RTSP feed instead:
# VIDEO_SOURCE=/path/to/test_fire.mp4 python fire_detector.py
```

**3. Frontend (React)**
```bash
cd react-frontend
npm install
npm run dev
# -> http://localhost:5173 (Vite proxies /api to the .NET backend)
```

## Notes / next steps

- **Detection model**: `fire_detector.py` ships with a colour-heuristic (HSV)
  detector so the pipeline runs end-to-end out of the box. Swap
  `detect_fire()` for a real trained model (ONNX/TensorRT/.pt) without
  touching any networking code — that function is the only seam.
- **Video feed**: `/api/video_feed` is a true `multipart/x-mixed-replace`
  MJPEG stream from .NET, so the React `<img>` tag just works, same as the
  old Flask behaviour.
- **Scaling out**: `FireState` is an in-memory singleton, fine for one
  backend instance. If you ever run multiple API instances behind a load
  balancer, move this to Redis (or add a SignalR backplane) so all
  instances see the same latest frame/status.
- **Telemetry rings** (uptime/signal/battery) are still static placeholders,
  same as the original markup — wire them to a real `/api/telemetry`
  endpoint once the hardware team exposes that data.
