import { Router } from "express";
import { createReport } from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { reportSchema } from "../validations/report.validation.js";

const router = Router();

router.post("/", authenticate, validate(reportSchema), createReport);

export default router;
