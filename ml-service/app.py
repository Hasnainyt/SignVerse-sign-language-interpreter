import base64
import pickle
import time

import cv2
import mediapipe as mp
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

# ── Load the trained model ───────────────────────────────────────────────
MODEL_PATH = "model.p"

with open(MODEL_PATH, "rb") as f:
    model_dict = pickle.load(f)
model = model_dict["model"]

# ── Same mediapipe Holistic setup as create_dataset.py ───────────────────
# static_image_mode=True because every request here is one independent
# frame with no guaranteed continuity between requests (this matches how
# the training images were processed, unlike the webcam-loop script which
# used tracking mode for smoother live video).
mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(
    static_image_mode=True,
    min_detection_confidence=0.3,
    model_complexity=1,
)

NUM_HAND_LANDMARKS = 21
HAND_FEATURE_LEN = NUM_HAND_LANDMARKS * 2  # 42

# ── Class index -> label, copied from inference_classifier.py ───────────
LABELS_DICT = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
    10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S',
    19: 'T', 20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z',
    26: '1', 27: '2', 28: '3', 29: '4', 30: '5', 31: '6', 32: '7', 33: '8', 34: '9', 35: '0',
    36: 'Hello', 37: 'Sign', 38: 'Language', 39: 'Bye-bye', 40: 'Again', 41: 'My', 42: 'You',
    43: 'He', 44: 'she', 45: 'Deaf', 46: 'Hearing', 47: 'Teacher', 48: 'Thank You',
    49: 'Please', 50: 'Sorry', 51: 'How are you?', 52: 'I am fine', 53: 'Name', 54: 'Good',
    55: 'Bad', 56: 'Correct', 57: 'Easy', 58: 'Difficult', 59: 'Child', 60: 'Understand',
    61: 'Remember', 62: 'Love', 63: 'Time', 64: 'This', 65: 'What', 66: 'Why', 67: 'How',
    68: 'From', 69: 'University', 70: 'Special',
}

app = Flask(__name__)
CORS(app)


def extract_hand_features(hand_landmarks):
    """Identical normalization to create_dataset.py / inference_classifier.py:
    subtract each hand's own min x/y so features are position-invariant.
    Returns a flat list of 42 values."""
    x_ = [lm.x for lm in hand_landmarks.landmark]
    y_ = [lm.y for lm in hand_landmarks.landmark]
    min_x, min_y = min(x_), min(y_)

    feats = []
    for lm in hand_landmarks.landmark:
        feats.append(lm.x - min_x)
        feats.append(lm.y - min_y)
    return feats


def decode_base64_image(data_url):
    """Accepts either a raw base64 string or a data: URL
    (e.g. "data:image/jpeg;base64,....") like canvas.toDataURL() produces."""
    if "," in data_url:
        data_url = data_url.split(",", 1)[1]
    img_bytes = base64.b64decode(data_url)
    img_arr = np.frombuffer(img_bytes, dtype=np.uint8)
    return cv2.imdecode(img_arr, cv2.IMREAD_COLOR)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"success": True, "message": "ML service is running"})


@app.route("/predict", methods=["POST"])
def predict():
    body = request.get_json(silent=True) or {}
    frame_data = body.get("frame")

    if not frame_data:
        return jsonify({"success": False, "message": "frame is required"}), 400

    try:
        frame = decode_base64_image(frame_data)
    except Exception:
        return jsonify({"success": False, "message": "Invalid image data"}), 400

    if frame is None:
        return jsonify({"success": False, "message": "Could not decode image"}), 400

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = holistic.process(frame_rgb)

    # ── Build the same fixed-length 86-value vector used in training ────
    left_feats = [0.0] * HAND_FEATURE_LEN
    right_feats = [0.0] * HAND_FEATURE_LEN
    hands_detected = 0

    if results.left_hand_landmarks:
        left_feats = extract_hand_features(results.left_hand_landmarks)
        hands_detected += 1

    if results.right_hand_landmarks:
        right_feats = extract_hand_features(results.right_hand_landmarks)
        hands_detected += 1

    if hands_detected == 0:
        return jsonify({
            "success": True,
            "data": None,
            "message": "No hand detected in frame",
        })

    if results.pose_landmarks:
        nose = results.pose_landmarks.landmark[mp_holistic.PoseLandmark.NOSE]
        head_pos = (nose.x, nose.y)
    else:
        head_pos = (0.0, 0.0)

    data_aux = left_feats + right_feats + [head_pos[0], head_pos[1]]
    features = np.asarray(data_aux).reshape(1, -1)

    prediction = model.predict(features)
    label = LABELS_DICT.get(int(prediction[0]), str(prediction[0]))

    confidence = None
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(features)[0]
        confidence = float(max(proba))

    return jsonify({
        "success": True,
        "data": {
            "text": label,
            "confidence": confidence,
            "timestamp": int(time.time() * 1000),
        },
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
