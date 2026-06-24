import { Router } from "express";
import { markNotificationRead, notifications } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validations/common.validation.js";

const router = Router();

router.use(authenticate);
router.get("/", notifications);
router.patch("/:id/read", validate(idParamSchema), markNotificationRead);

export default router;
