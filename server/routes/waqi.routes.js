import { Router } from "express";
import { getCity, getGeo, getSearch, getCityUID, getHistory } from "../controller/waqi.controllers.js";

const router = Router();

router.get("/city", getCity);

router.post("/geo", getGeo);

router.get("/search", getSearch);

router.get('/uid/:uid', getCityUID);

router.get("/history", getHistory);

export default router;
