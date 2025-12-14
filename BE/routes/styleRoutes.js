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

router.get("/", auth, getStyles);
router.post("/", auth, createStyle);
router.patch("/:id", auth, updateStyle);
router.patch("/:id/disable", auth, disableStyle);
router.patch("/:id/enable", auth, enableStyle);

export default router;
