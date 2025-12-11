import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  disableCategory,
  enableCategory
} from "../controllers/categoryController.js";

import auth from "../middleware/auth.js";

const router = express.Router();

// Public route
router.get("/", getCategories);

// Authenticated routes
router.post("/", auth, createCategory);
router.put("/:id", auth, updateCategory);
router.put("/:id/disable", auth, disableCategory);
router.put("/:id/enable", auth, enableCategory);

export default router;
