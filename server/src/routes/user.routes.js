import { Router } from "express";
import { changePassword, favorites, followUser, me, ownListings, publicSellerProfile, purchases, unfollowUser, updateProfile, uploadAvatar } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { changePasswordSchema, updateProfileSchema } from "../validations/user.validation.js";

const router = Router();

router.get("/:id/public", publicSellerProfile);

router.use(authenticate);
router.get("/me", me);
router.patch("/profile", validate(updateProfileSchema), updateProfile);
router.post("/avatar", upload.single("avatar"), uploadAvatar);
router.post("/:id/follow", followUser);
router.delete("/:id/follow", unfollowUser);
router.patch("/password", validate(changePasswordSchema), changePassword);
router.get("/listings", ownListings);
router.get("/favorites", favorites);
router.get("/purchases", purchases);

export default router;
