# Production Dockerfile for AI Edge Detection Engine
FROM python:3.11-slim

WORKDIR /app

# Install native libraries required by OpenCV (libglib, libGL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model weights and application scripts
COPY . .

# Default Environment Variables
ENV PYTHONUNBUFFERED=1
ENV BACKEND_URL=http://dotnet-backend:5080
ENV VIDEO_SOURCE=0
ENV SEND_INTERVAL_SEC=0.4
ENV JPEG_QUALITY=80

CMD ["python", "fire_detector.py"]
