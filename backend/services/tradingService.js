const axios = require("axios");
const { getMarket, getFeatures } = require("./marketService");

const ML_URL = process.env.ML_URL || "http://localhost:8000";

let balance = 100000;
let holdings = 0;
let entryPrice = 0;
let trades = [];
let botRunning = false;
let botTimer = null;
let lastPrediction = null;

function getPortfolio() {
  const market = getMarket();
  const holdingsValue = holdings * market.price;
  const totalValue = balance + holdingsValue;
  const profitLoss = totalValue - 100000;

  return {
    balance: Number(balance.toFixed(2)),
    holdings: Number(holdings.toFixed(6)),
    holdingsValue: Number(holdingsValue.toFixed(2)),
    totalValue: Number(totalValue.toFixed(2)),
    profitLoss: Number(profitLoss.toFixed(2)),
    returnPercent: Number(((profitLoss / 100000) * 100).toFixed(2)),
    entryPrice: Number(entryPrice.toFixed(2))
  };
}

async function predict() {
  const market = getMarket();
  const features = getFeatures(market);

  const response = await axios.post(`${ML_URL}/predict`, features);

  lastPrediction = {
    ...response.data,
    market,
    updatedAt: new Date().toISOString()
  };

  return lastPrediction;
}

function buy(quantity, price, source = "MANUAL") {
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");

  const cost = quantity * price;

  if (cost > balance) {
    throw new Error("Insufficient balance");
  }

  const oldValue = holdings * entryPrice;
  balance -= cost;
  holdings += quantity;

  entryPrice = holdings > 0
    ? (oldValue + cost) / holdings
    : price;

  const trade = {
    id: Date.now(),
    side: "BUY",
    quantity,
    price: Number(price.toFixed(2)),
    amount: Number(cost.toFixed(2)),
    source,
    time: new Date().toISOString()
  };

  trades.unshift(trade);
  return trade;
}

function sell(quantity, price, source = "MANUAL") {
  if (quantity <= 0) throw new Error("Quantity must be greater than 0");
  if (quantity > holdings) throw new Error("Not enough holdings");

  const amount = quantity * price;
  balance += amount;
  holdings -= quantity;

  if (holdings === 0) {
    entryPrice = 0;
  }

  const trade = {
    id: Date.now(),
    side: "SELL",
    quantity,
    price: Number(price.toFixed(2)),
    amount: Number(amount.toFixed(2)),
    source,
    time: new Date().toISOString()
  };

  trades.unshift(trade);
  return trade;
}

async function runBotCycle() {
  try {
    const prediction = await predict();
    const price = prediction.market.price;

    // Simple paper-trading risk rules.
    if (holdings > 0 && entryPrice > 0) {
      const stopLoss = entryPrice * 0.97;
      const takeProfit = entryPrice * 1.05;

      if (price <= stopLoss || price >= takeProfit) {
        sell(holdings, price, "RISK_RULE");
        return;
      }
    }

    // Only open a position when there is no current position.
    if (holdings === 0 && prediction.prediction === "BUY") {
      const amountToInvest = balance * 0.10;
      const quantity = amountToInvest / price;
      buy(quantity, price, "ML_BOT");
    }

    // Close an existing position when ML gives SELL.
    if (holdings > 0 && prediction.prediction === "SELL") {
      sell(holdings, price, "ML_BOT");
    }
  } catch (error) {
    console.error("Bot cycle error:", error.message);
  }
}

function startBot() {
  if (botRunning) return false;

  botRunning = true;
  runBotCycle();

  botTimer = setInterval(runBotCycle, 5000);
  return true;
}

function stopBot() {
  if (botTimer) clearInterval(botTimer);
  botTimer = null;
  botRunning = false;
}

function getState() {
  return {
    running: botRunning,
    prediction: lastPrediction,
    portfolio: getPortfolio(),
    trades
  };
}

function manualBuy(quantity) {
  const market = getMarket();
  return buy(Number(quantity), market.price);
}

function manualSell(quantity) {
  const market = getMarket();
  return sell(Number(quantity), market.price);
}

module.exports = {
  getMarket,
  getPortfolio,
  getState,
  predict,
  manualBuy,
  manualSell,
  startBot,
  stopBot
};
