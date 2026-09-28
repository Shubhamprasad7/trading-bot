from pathlib import Path
import joblib
import pandas as pd

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_FILE = Path("models/trading_model.joblib")

if not MODEL_FILE.exists():
    raise RuntimeError(
        "Model not found. Run: python generate_data.py && python train.py"
    )

bundle = joblib.load(MODEL_FILE)
model = bundle["model"]
features = bundle["features"]
labels = bundle["labels"]

@app.get("/")
def home():
    return jsonify({
        "message": "Trading Bot ML API is running",
        "model": "Random Forest",
        "endpoint": "/predict"
    })

@app.post("/predict")
def predict():
    data = request.get_json(silent=True) or {}

    missing = [feature for feature in features if feature not in data]
    if missing:
        return jsonify({
            "error": "Missing features",
            "missing": missing
        }), 400

    try:
        row = pd.DataFrame([{
            feature: float(data[feature])
            for feature in features
        }])

        prediction = int(model.predict(row)[0])
        probabilities = model.predict_proba(row)[0]
        classes = model.classes_

        probability_map = {
            int(cls): float(prob)
            for cls, prob in zip(classes, probabilities)
        }

        return jsonify({
            "prediction": labels[prediction],
            "signal": prediction,
            "confidence": round(probability_map.get(prediction, 0) * 100, 2),
            "probabilities": {
                labels[int(cls)]: round(float(prob) * 100, 2)
                for cls, prob in zip(classes, probabilities)
            }
        })

    except (ValueError, TypeError) as exc:
        return jsonify({"error": str(exc)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
