import { useEffect, useState, useCallback } from "react";
import Auth from "./Auth";
import {
  getMarket,
  getPortfolio,
  getTrades,
  getPrediction,
  getBotStatus,
  startBot,
  stopBot,
  buy,
  sell
} from "./services/api";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [market, setMarket] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [trades, setTrades] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [running, setRunning] = useState(false);
  const [quantity, setQuantity] = useState(0.01);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [marketRes, portfolioRes, tradesRes, predictionRes, statusRes] =
        await Promise.all([
          getMarket(),
          getPortfolio(),
          getTrades(),
          getPrediction(),
          getBotStatus()
        ]);

      setMarket(marketRes.data);
      setPortfolio(portfolioRes.data);
      setTrades(tradesRes.data);
      setPrediction(predictionRes.data);
      setRunning(statusRes.data?.running || false);
    } catch (error) {
      setMessage(
        error.response?.data?.error ||
        "Could not connect to backend/ML service."
      );
    }
  }, []);

  useEffect(() => {
    // Only poll backend when user is logged in
    if (!user) return;

    let cancelled = false;

    const loadData = async () => {
      if (!cancelled) {
        await refresh();
      }
    };

    loadData();
    const timer = setInterval(loadData, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user, refresh]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function handleStart() {
    await startBot();
    setRunning(true);
    setMessage("Trading bot started.");
  }

  async function handleStop() {
    await stopBot();
    setRunning(false);
    setMessage("Trading bot stopped.");
  }

  async function handleBuy() {
    try {
      await buy(Number(quantity));
      setMessage("Buy order executed.");
      refresh();
    } catch (error) {
      setMessage(error.response?.data?.error || "Buy failed.");
    }
  }

  async function handleSell() {
    try {
      await sell(Number(quantity));
      setMessage("Sell order executed.");
      refresh();
    } catch (error) {
      setMessage(error.response?.data?.error || "Sell failed.");
    }
  }

  // If user is not logged in, show the Registration / Login page
  if (!user) {
    return <Auth onAuthSuccess={(userData) => setUser(userData)} />;
  }

  // If user is logged in, show the ML Trading Dashboard
  return (
    <div className="app">
      <header>
        <div>
          <h1>🤖 ML Trading Bot</h1>
          <p>Logged in as: <strong>{user.username || user.email}</strong></p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span className={running ? "status on" : "status"}>
            {running ? "● BOT RUNNING" : "● BOT STOPPED"}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {message && <div className="message">{message}</div>}

        <section className="cards">
          <div className="card">
            <h3>Market</h3>
            <strong>
              {market ? `$${market.price?.toLocaleString()}` : "..."}
            </strong>
            <p>
              {market ? `${market.change}%` : "..."} change
            </p>
          </div>

          <div className="card">
            <h3>Prediction</h3>
            <strong className={prediction?.prediction?.toLowerCase()}>
              {prediction?.prediction || "..."}
            </strong>
            <p>
              Confidence: {prediction?.confidence ?? 0}%
            </p>
          </div>

          <div className="card">
            <h3>Balance</h3>
            <strong>
              ₹{portfolio?.balance?.toLocaleString() ?? "..."}
            </strong>
            <p>Available cash</p>
          </div>

          <div className="card">
            <h3>Profit / Loss</h3>
            <strong>
              ₹{portfolio?.profitLoss?.toLocaleString() ?? "..."}
            </strong>
            <p>{portfolio?.returnPercent ?? 0}% return</p>
          </div>
        </section>

        <section className="panel">
          <h2>Bot Control</h2>

          <div className="buttons">
            <button className="start" onClick={handleStart}>
              Start Bot
            </button>

            <button className="stop" onClick={handleStop}>
              Stop Bot
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Manual Paper Trade</h2>

          <div className="trade-form">
            <label>
              Quantity
              <input
                type="number"
                min="0.000001"
                step="0.001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>

            <button className="buy" onClick={handleBuy}>
              BUY
            </button>

            <button className="sell" onClick={handleSell}>
              SELL
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Portfolio</h2>

          <div className="portfolio">
            <div>
              <span>Holdings</span>
              <strong>{portfolio?.holdings ?? 0}</strong>
            </div>

            <div>
              <span>Holdings Value</span>
              <strong>
                ₹{portfolio?.holdingsValue?.toLocaleString() ?? 0}
              </strong>
            </div>

            <div>
              <span>Total Value</span>
              <strong>
                ₹{portfolio?.totalValue?.toLocaleString() ?? 0}
              </strong>
            </div>

            <div>
              <span>Entry Price</span>
              <strong>${portfolio?.entryPrice ?? 0}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Trade History</h2>

          {trades.length === 0 ? (
            <p>No trades yet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Side</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Amount</th>
                    <th>Source</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id}>
                      <td className={trade.side.toLowerCase()}>
                        {trade.side}
                      </td>
                      <td>{trade.quantity.toFixed(6)}</td>
                      <td>${trade.price?.toLocaleString()}</td>
                      <td>${trade.amount?.toLocaleString()}</td>
                      <td>{trade.source}</td>
                      <td>
                        {new Date(trade.time).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;