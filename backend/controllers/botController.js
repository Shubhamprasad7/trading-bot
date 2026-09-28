const {
  startBot,
  stopBot,
  predict,
  getState
} = require("../services/tradingService");

function start(req, res) {
  const started = startBot();

  res.json({
    message: started ? "Bot started" : "Bot is already running",
    running: getState().running
  });
}

function stop(req, res) {
  stopBot();

  res.json({
    message: "Bot stopped",
    running: false
  });
}

async function prediction(req, res) {
  try {
    res.json(await predict());
  } catch (error) {
    res.status(503).json({
      error: "ML service unavailable",
      details: error.message
    });
  }
}

function status(req, res) {
  res.json(getState());
}

module.exports = { start, stop, prediction, status };
