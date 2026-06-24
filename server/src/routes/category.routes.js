import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validations/common.validation.js";
import { categorySchema } from "../validations/category.validation.js";

const router = Router();

router.get("/", listCategories);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.single("image"),
  validate(categorySchema),
  createCategory,
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  upload.single("image"),
  validate(idParamSchema.merge(categorySchema.partial())),
  updateCategory,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(idParamSchema),
  deleteCategory,
);

export default router;
