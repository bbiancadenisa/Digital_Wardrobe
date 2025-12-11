import express from "express";
import { getSeasons } from "../controllers/seasonController.js";

const router = express.Router();

router.get("/", getSeasons);

export default router;
