import express from "express";
import {
  getStyles,
  createStyle,
  updateStyle,
  disableStyle,
  enableStyle
} from "../controllers/styleController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

// Public route
router.get("/", getStyles);

// Authenticated routes
router.post("/", auth, createStyle);
router.put("/:id", auth, updateStyle);
router.put("/:id/disable", auth, disableStyle);
router.put("/:id/enable", auth, enableStyle);

export default router;
