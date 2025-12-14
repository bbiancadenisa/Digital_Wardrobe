import express from "express";
import auth from "../middleware/auth.js";
import {
  createOutfit,
  getOutfits,
  getOutfitById,
  deleteOutfit,
} from "../controllers/outfitController.js";

const router = express.Router();

router.post("/", auth, createOutfit);
router.get("/", auth, getOutfits);
router.get("/:id", auth, getOutfitById);
router.delete("/:id", auth, deleteOutfit);

export default router;
