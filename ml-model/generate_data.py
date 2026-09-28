from pathlib import Path
import numpy as np
import pandas as pd

np.random.seed(42)

rows = 2500
dates = pd.date_range("2018-01-01", periods=rows, freq="h")

price = 50000.0
records = []

for i in range(rows):
    # Simulated market movement for demonstration only.
    drift = 0.00005
    shock = np.random.normal(0, 0.004)
    price *= (1 + drift + shock)

    close = max(price, 100)
    open_price = close * (1 + np.random.normal(0, 0.001))
    high = max(open_price, close) * (1 + abs(np.random.normal(0, 0.002)))
    low = min(open_price, close) * (1 - abs(np.random.normal(0, 0.002)))
    volume = abs(np.random.normal(10000, 1800)) + 1000

    records.append([dates[i], open_price, high, low, close, volume])

df = pd.DataFrame(
    records,
    columns=["timestamp", "open", "high", "low", "close", "volume"]
)

out = Path("data")
out.mkdir(exist_ok=True)
df.to_csv(out / "market_data.csv", index=False)

print(f"Created {len(df)} rows at data/market_data.csv")
