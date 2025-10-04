import express from "express";

import accountRouter from "./account.route.js"
import waqiRouter from "./waqi.routes.js"

const router = express.Router();

// Index router
router.get("/", (req, res) => {
  res.send("Chào mừng đến với server API của AirForce!")
})

// Tách controller xử lý vào folder controller
router.use("/account", accountRouter);

router.use("/waqi", waqiRouter);

export default router