import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const getMarket = () => api.get("/market");
export const getPortfolio = () => api.get("/portfolio");
export const getTrades = () => api.get("/trades");
export const getPrediction = () => api.get("/bot/predict");
export const getBotStatus = () => api.get("/bot/status");


export const startBot = () => api.post("/bot/start");
export const stopBot = () => api.post("/bot/stop");
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);

export const buy = (quantity) =>
  api.post("/trades/buy", { quantity });

export const sell = (quantity) =>
  api.post("/trades/sell", { quantity });
