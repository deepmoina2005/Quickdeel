import { Router } from "express";
import { createReview, sellerReviews } from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validations/common.validation.js";
import { reviewSchema } from "../validations/review.validation.js";

const router = Router();

router.get("/seller/:id", validate(idParamSchema), sellerReviews);
router.post("/", authenticate, validate(reviewSchema), createReview);

export default router;
