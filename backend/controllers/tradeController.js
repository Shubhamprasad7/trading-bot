const {
  manualBuy,
  manualSell,
  getState
} = require("../services/tradingService");

function buy(req, res) {
  try {
    const trade = manualBuy(Number(req.body.quantity));
    res.json({ message: "Buy order executed", trade });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

function sell(req, res) {
  try {
    const trade = manualSell(Number(req.body.quantity));
    res.json({ message: "Sell order executed", trade });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

function history(req, res) {
  res.json(getState().trades);
}

module.exports = { buy, sell, history };
