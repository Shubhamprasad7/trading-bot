require("dotenv").config();

const express = require("express");
const cors = require("cors");

const marketRoutes = require("./routes/marketRoutes");
const tradeRoutes = require("./routes/tradeRoutes");
const botRoutes = require("./routes/botRoutes");
const portfolioRoutes = require("./routes/portfolioRoutes");
const authRoutes = require('./routes/authRoutes');



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Trading Bot Backend is running",
    status: "OK"
  });
});

app.use("/api/market", marketRoutes);
app.use("/api/trades", tradeRoutes);
app.use("/api/bot", botRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
