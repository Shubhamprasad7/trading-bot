const router = require("express").Router();
const {
  buy,
  sell,
  history
} = require("../controllers/tradeController");

router.post("/buy", buy);
router.post("/sell", sell);
router.get("/", history);

module.exports = router;
