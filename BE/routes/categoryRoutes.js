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

router.get("/", auth, getCategories);
router.post("/", auth, createCategory);
router.patch("/:id", auth, updateCategory);
router.patch("/:id/disable", auth, disableCategory);
router.patch("/:id/enable", auth, enableCategory);


export default router;
