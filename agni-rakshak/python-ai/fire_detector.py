"""
AGNI-RAKSHAK :: Edge AI YOLO Detection Service (Siren + Telegram Alerts)
----------------------------------------------------------------------
Reads configurations seamlessly from a localized .env file context,
runs local YOLOv8 inferences, runs localized background sirens,
and pushes alerts to the designated Telegram group chat.
"""

import os
import time
import logging
import threading

import cv2
import numpy as np
import requests
from ultralytics import YOLO
from dotenv import load_dotenv

# Load environment variables from the .env file at runtime
load_dotenv()

# Handle cross-platform OS audio capabilities natively
try:
    import winsound
except ImportError:
    winsound = None

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")
log = logging.getLogger("agni-rakshak-ai")

# ==============================================================================
# CONFIGURATIONS (Dynamically pulled from your .env file)
# ==============================================================================
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:5080")
VIDEO_SOURCE = os.environ.get("VIDEO_SOURCE", "0")
SEND_INTERVAL_SEC = float(os.environ.get("SEND_INTERVAL_SEC", "1.0"))
JPEG_QUALITY = int(os.environ.get("JPEG_QUALITY", "80"))
YOLO_MODEL_PATH = os.environ.get("YOLO_MODEL_PATH", "yolov8n-fire.pt")

STATUS_ENDPOINT = f"{BACKEND_URL}/api/ingest/status"
FRAME_ENDPOINT = f"{BACKEND_URL}/api/ingest/frame"
YOLO_CONFIDENCE_THRESHOLD = 0.40  # Global filtering threshold for inferences

# Pulling sensitive Telegram keys safely from the environment
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID")
ALERT_COOLDOWN_SEC = float(os.environ.get("ALERT_COOLDOWN_SEC", "60.0"))
# ==============================================================================

# Initialize YOLOv8 Model Engine
log.info("Loading YOLO model weights from: %s", YOLO_MODEL_PATH)
try:
    model = YOLO(YOLO_MODEL_PATH)
except Exception as e:
    log.error("Could not load YOLO model weights. Verify file path or execution environment: %s", e)
    raise e


def _play_siren_async():
    """Background task to play an oscillating alarm sound."""
    if winsound:
        for _ in range(3):
            winsound.Beep(1200, 300) # High pitch: 1200Hz for 300ms
            winsound.Beep(800, 300)  # Low pitch: 800Hz for 300ms
    else:
        print("\a", end="", flush=True)


def trigger_siren():
    """Fires the audio siren in a separate daemon thread to prevent video stream lag."""
    threading.Thread(target=_play_siren_async, daemon=True).start()


def send_telegram_alert(confidence: float):
    """Dispatches a structured Markdown emergency notification to the designated Telegram chat resource."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        log.error("Telegram API credentials are missing from environment. Skipping broadcast.")
        return

    alert_message = (
        f"🚨 *AGNI-RAKSHAK EMERGENCY ALERT*\n\n"
        f"🔥 *Live fire signature verified in monitored zones!*\n"
        f"🤖 *AI Confidence Metric:* {confidence}%\n"
        f"📍 *Action Status:* Automated mitigation protocols initialized. Verify physical sector conditions immediately."
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": alert_message,
        "parse_mode": "Markdown"
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()
        log.info("Telegram emergency event broadcast successfully pushed to endpoint.")
    except Exception as exc:
        log.error("Failed to transmit emergency event to Telegram channel context: %s", exc)


def detect_fire(frame: np.ndarray) -> dict:
    """Scores a single BGR frame using a lightweight YOLOv8 network."""
    results = model.predict(frame, conf=YOLO_CONFIDENCE_THRESHOLD, verbose=False)
    
    is_fire = False
    max_fire_conf = 0.0
    max_smoke_conf = 0.0
    
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            class_name = model.names[class_id].lower()
            confidence_score = float(box.conf[0])
            
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            
            if "fire" in class_name:
                is_fire = True
                if confidence_score > max_fire_conf:
                    max_fire_conf = confidence_score
                
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, f"FIRE {round(confidence_score * 100, 1)}%", 
                            (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                            
            elif "smoke" in class_name:
                if confidence_score > max_smoke_conf:
                    max_smoke_conf = confidence_score
                
                cv2.rectangle(frame, (x1, y1), (x2, y2), (128, 128, 128), 2)
                cv2.putText(frame, f"SMOKE {round(confidence_score * 100, 1)}%", 
                            (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 128), 2)

    confidence = round(max_fire_conf * 100, 1) if is_fire else 0.0
    smoke_density = round(max_smoke_conf * 100, 1)
    
    if is_fire:
        class_label = "Fire"
    elif smoke_density > 25.0:
        class_label = "Smoke-trace"
    else:
        class_label = "Normal"
        
    return {
        "className": class_label,
        "confidence": confidence,
        "isFire": is_fire,
        "smokeDensity": smoke_density,
    }


def open_capture(source: str) -> cv2.VideoCapture:
    src = int(source) if source.isdigit() else source
    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video source: {source}")
    return cap


def push_status(status: dict):
    try:
        requests.post(STATUS_ENDPOINT, json=status, timeout=2)
    except requests.RequestException as exc:
        log.warning("Status push failed: %s", exc)


def push_frame(frame: np.ndarray):
    ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
    if not ok:
        return
    try:
        requests.post(
            FRAME_ENDPOINT,
            files={"frame": ("frame.jpg", buf.tobytes(), "image/jpeg")},
            timeout=2,
        )
    except requests.RequestException as exc:
        log.warning("Frame push failed: %s", exc)


def main():
    log.info("Starting AGNI-RAKSHAK Deep Inference Engine")
    log.info("Backend target URL configured as: %s", BACKEND_URL)
    cap = open_capture(VIDEO_SOURCE)

    last_send = 0.0
    last_alert_time = 0.0
    
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                log.warning("Frame grab failed, retrying source stream...")
                cap.release()
                time.sleep(1.0)
                cap = open_capture(VIDEO_SOURCE)
                continue

            now = time.time()
            if now - last_send >= SEND_INTERVAL_SEC:
                status = detect_fire(frame)
                
                if status["isFire"]:
                    log.warning("🔥 REAL FIRE THREAT VERIFIED: confidence=%s%%", status["confidence"])
                    trigger_siren()
                    
                    if now - last_alert_time >= ALERT_COOLDOWN_SEC:
                        log.info("Notification cooldown clear. Dispatching Telegram channel alerts...")
                        send_telegram_alert(status["confidence"])
                        last_alert_time = now
                    else:
                        remaining_cooldown = round(ALERT_COOLDOWN_SEC - (now - last_alert_time), 1)
                        log.info("Telegram notification suppressed. Cooldown remaining: %ss", remaining_cooldown)
                
                push_status(status)
                push_frame(frame)
                last_send = now

    except KeyboardInterrupt:
        log.info("Gracefully shutting down deep inference execution loop")
    finally:
        cap.release()


if __name__ == "__main__":
    main()