import { Router } from "express";
import { addFavorite, removeFavorite } from "../controllers/favorite.controller.js";
import { createListing, deleteListing, getListing, listListings, markSold, updateListing, uploadListingImages } from "../controllers/listing.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validations/common.validation.js";
import { createListingSchema, listingSearchSchema, updateListingSchema } from "../validations/listing.validation.js";

const router = Router();

router.get("/", validate(listingSearchSchema), listListings);
router.get("/:id", validate(idParamSchema), getListing);
router.post("/", authenticate, upload.array("images", 8), validate(createListingSchema), createListing);
router.patch("/:id", authenticate, validate(idParamSchema.merge(updateListingSchema)), updateListing);
router.delete("/:id", authenticate, validate(idParamSchema), deleteListing);
router.patch("/:id/sold", authenticate, validate(idParamSchema), markSold);
router.post("/:id/images", authenticate, upload.array("images", 8), validate(idParamSchema), uploadListingImages);
router.post("/:id/favorite", authenticate, validate(idParamSchema), addFavorite);
router.delete("/:id/favorite", authenticate, validate(idParamSchema), removeFavorite);

export default router;
