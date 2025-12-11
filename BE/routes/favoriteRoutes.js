import express from "express";
import auth from "../middleware/auth.js";
import {
  addFavorite,
  removeFavorite,
  getFavorites
} from "../controllers/favoriteController.js";

const router = express.Router();

router.get("/", auth, getFavorites);
router.post("/:outfit_id", auth, addFavorite);
router.delete("/:outfit_id", auth, removeFavorite);

export default router;
