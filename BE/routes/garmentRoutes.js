import { Router } from "express";
import multer from "multer";
import {
  createGarment,
  createMultipleGarments,
  deleteGarment,
  getGarment,
  listGarments,
  updateGarment,
} from "../controllers/garmentController.js";
import auth from "../middleware/auth.js";

const upload = multer({ storage: multer.memoryStorage() }); // receive file buffer
const router = Router();

router.get("/", auth, listGarments);
router.get("/:id", auth, getGarment);
router.post("/", auth, upload.single("image"), createGarment);
router.put("/:id", auth, upload.single("image"), updateGarment);
router.delete("/:id", auth, deleteGarment);
router.post("/bulk", auth, createMultipleGarments);

export default router;
