import { Router } from "express";
import { acceptOffer, hideConversation, listConversations, rejectOffer, sendImageMessage, sendMessage, sendOffer, startConversation, startListingConversation } from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { idParamSchema } from "../validations/common.validation.js";
import { conversationSchema, messageSchema, offerSchema } from "../validations/chat.validation.js";

const router = Router();

router.use(authenticate);
router.get("/conversations", listConversations);
router.post("/conversations", validate(conversationSchema), startConversation);
router.post("/listings/:id/conversation", validate(idParamSchema), startListingConversation);
router.post("/conversations/:id/messages", validate(idParamSchema.merge(messageSchema)), sendMessage);
router.post("/conversations/:id/images", validate(idParamSchema), upload.single("image"), sendImageMessage);
router.post("/conversations/:id/offers", validate(idParamSchema.merge(offerSchema)), sendOffer);
router.patch("/offers/:id/accept", validate(idParamSchema), acceptOffer);
router.patch("/offers/:id/reject", validate(idParamSchema), rejectOffer);
router.delete("/conversations/:id", validate(idParamSchema), hideConversation);

export default router;
