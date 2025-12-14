import express from "express";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import {
  createOutfit,
  getOutfits,
  getOutfitById,
  deleteOutfit,
  updateOutfit
} from "../controllers/outfitController.js";

const router = express.Router();

router.post("/", auth, upload.single("image"),createOutfit);
router.get("/", auth, getOutfits);
router.get("/:id", auth, getOutfitById);
router.delete("/:id", auth, deleteOutfit);
router.patch("/:id", auth, upload.single("image"), updateOutfit);
  
export default router;
