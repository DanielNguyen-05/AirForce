import { Router } from "express";
import waqiRoute from "./waqi.routes.js";

const router = Router();
router.use("/waqi", waqiRoute);

export default router;
