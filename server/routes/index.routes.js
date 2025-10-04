import express from "express";

const router = express.Router();

// Index router
router.get("/", (req, res) => {
  res.send("Chào mừng đến với server API của AirForce!")
})
// Tách controller xử lý vào folder controller

export default router