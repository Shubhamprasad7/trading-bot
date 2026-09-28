const router = require("express").Router();
const { market } = require("../controllers/marketController");

router.get("/", market);

module.exports = router;
