import { Router } from "express";
import { getGeo, getHistory } from "../controllers/waqi.controllers.js";

const router = Router();

router.post("/geo", getGeo);

// router.get('/uid/:uid', getCityUID);

router.post("/history", getHistory);

export default router;
