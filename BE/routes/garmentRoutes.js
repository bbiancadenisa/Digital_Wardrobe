import { Router } from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import {
  createGarment, listGarments, getGarment, updateGarment, deleteGarment
} from "../controllers/garmentController.js";

const upload = multer({ storage: multer.memoryStorage() }); // receive file buffer
const router = Router();

router.get("/", auth, listGarments);
router.get("/:id", auth, getGarment);
router.post("/", auth, upload.single("image"), createGarment);
router.put("/:id", auth, upload.single("image"), updateGarment);
router.delete("/:id", auth, deleteGarment);

export default router;
