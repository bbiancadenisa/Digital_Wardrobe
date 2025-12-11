import express from "express";
import auth from "../middleware/auth.js";
import { getSuggestions } from "../controllers/suggestionController.js";

const router = express.Router();

router.post("/", auth, getSuggestions);

export default router;
