const { getPortfolio } = require("../services/tradingService");

function portfolio(req, res) {
  res.json(getPortfolio());
}

module.exports = { portfolio };
