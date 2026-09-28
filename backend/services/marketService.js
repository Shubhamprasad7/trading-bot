let prices = [];
let currentPrice = 50000;

for (let i = 0; i < 30; i++) {
  currentPrice *= 1 + (Math.random() - 0.5) * 0.01;
  prices.push(currentPrice);
}

function getMarket() {
  const movement = (Math.random() - 0.48) * 0.004;
  currentPrice = Math.max(100, currentPrice * (1 + movement));
  prices.push(currentPrice);

  if (prices.length > 100) {
    prices.shift();
  }

  const previous = prices[prices.length - 2] || currentPrice;
  const change = ((currentPrice - previous) / previous) * 100;

  return {
    symbol: "BTCUSDT",
    price: Number(currentPrice.toFixed(2)),
    change: Number(change.toFixed(2)),
    volume: Math.round(10000 + Math.random() * 5000),
    timestamp: new Date().toISOString()
  };
}

function getFeatures(market) {
  const last10 = prices.slice(-10);
  const last20 = prices.slice(-20);

  const sma10 = last10.reduce((a, b) => a + b, 0) / last10.length;
  const sma20 = last20.reduce((a, b) => a + b, 0) / last20.length;

  const returns = [];
  for (let i = 1; i < last10.length; i++) {
    returns.push((last10[i] - last10[i - 1]) / last10[i - 1]);
  }

  const mean = returns.length
    ? returns.reduce((a, b) => a + b, 0) / returns.length
    : 0;

  const variance = returns.length
    ? returns.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / returns.length
    : 0;

  const volatility = Math.sqrt(variance);

  const gains = [];
  const losses = [];

  for (let i = 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1];
    if (difference >= 0) gains.push(difference);
    else losses.push(Math.abs(difference));
  }

  const avgGain = gains.slice(-14).reduce((a, b) => a + b, 0) / Math.max(gains.slice(-14).length, 1);
  const avgLoss = losses.slice(-14).reduce((a, b) => a + b, 0) / Math.max(losses.slice(-14).length, 1);

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return {
    return_1: market.change / 100,
    sma_10_ratio: market.price / sma10 - 1,
    sma_20_ratio: market.price / sma20 - 1,
    rsi: Number(rsi.toFixed(4)),
    volatility: Number(volatility.toFixed(8)),
    volume_ratio: market.volume / 12000
  };
}

module.exports = { getMarket, getFeatures };
