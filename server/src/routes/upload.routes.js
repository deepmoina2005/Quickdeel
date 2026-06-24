import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { saveUploadedImage } from "../services/upload.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/image",
  authenticate,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    const imageUrl = await saveUploadedImage(req.file, "general");
    res.status(201).json({ success: true, imageUrl });
  })
);

export default router;
