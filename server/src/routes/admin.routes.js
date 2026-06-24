import { Router } from "express";
import { z } from "zod";
import { dashboard, listings, reports, updateReport, updateUser, users } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validations/common.validation.js";

const router = Router();
const reportStatusSchema = z.object({ body: z.object({ status: z.enum(["OPEN", "REVIEWED", "DISMISSED"]) }) });
const userSchema = z.object({
  body: z.object({
    role: z.enum(["USER", "ADMIN"]).optional(),
    isVerifiedSeller: z.boolean().optional(),
    isEliteSeller: z.boolean().optional()
  })
});

router.use(authenticate, authorize("ADMIN"));
router.get("/dashboard", dashboard);
router.get("/users", users);
router.patch("/users/:id", validate(idParamSchema.merge(userSchema)), updateUser);
router.get("/listings", listings);
router.get("/reports", reports);
router.patch("/reports/:id", validate(idParamSchema.merge(reportStatusSchema)), updateReport);

export default router;
