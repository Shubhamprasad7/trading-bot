const { getMarket } = require("../services/tradingService");

function market(req, res) {
  res.json(getMarket());
}

module.exports = { market };
