const router = require("express").Router();
const { portfolio } = require("../controllers/portfolioController");

router.get("/", portfolio);

module.exports = router;
