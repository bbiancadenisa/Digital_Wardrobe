import { Router } from "express";
import auth from "../middleware/auth.js";
import { createOutfit, listOutfits, deleteOutfit } from "../controllers/outfitController.js";

const router = Router();
router.get("/", auth, listOutfits);
router.post("/", auth, createOutfit);      // body: { name, garment_ids: [1,2,3] }
router.delete("/:id", auth, deleteOutfit);
export default router;
