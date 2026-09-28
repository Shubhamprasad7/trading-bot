const router = require("express").Router();
const {
  start,
  stop,
  prediction,
  status
} = require("../controllers/botController");

router.post("/start", start);
router.post("/stop", stop);
router.get("/predict", prediction);
router.get("/status", status);

module.exports = router;
