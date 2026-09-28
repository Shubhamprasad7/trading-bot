from pathlib import Path
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

DATA_FILE = Path("data/market_data.csv")
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

FEATURES = [
    "return_1",
    "sma_10_ratio",
    "sma_20_ratio",
    "rsi",
    "volatility",
    "volume_ratio",
]

df = pd.read_csv(DATA_FILE)

df["return_1"] = df["close"].pct_change()
df["sma_10"] = df["close"].rolling(10).mean()
df["sma_20"] = df["close"].rolling(20).mean()
df["sma_10_ratio"] = df["close"] / df["sma_10"] - 1
df["sma_20_ratio"] = df["close"] / df["sma_20"] - 1

delta = df["close"].diff()
gain = delta.clip(lower=0).rolling(14).mean()
loss = (-delta.clip(upper=0)).rolling(14).mean()
rs = gain / loss.replace(0, np.nan)
df["rsi"] = 100 - (100 / (1 + rs))

df["volatility"] = df["return_1"].rolling(10).std()
df["volume_ratio"] = df["volume"] / df["volume"].rolling(20).mean()

# Future return is used only to create the training label.
# It must NOT be used as a feature.
future_return = df["close"].shift(-3) / df["close"] - 1

def make_label(value):
    if value > 0.002:
        return 1       # BUY
    if value < -0.002:
        return -1      # SELL
    return 0           # HOLD

df["target"] = future_return.apply(make_label)
df = df.dropna().copy()

X = df[FEATURES]
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

pred = model.predict(X_test)

print("Accuracy:", round(accuracy_score(y_test, pred), 4))
print(classification_report(y_test, pred, zero_division=0))

joblib.dump(
    {
        "model": model,
        "features": FEATURES,
        "labels": {-1: "SELL", 0: "HOLD", 1: "BUY"},
    },
    MODEL_DIR / "trading_model.joblib"
)

print("Saved models/trading_model.joblib")
