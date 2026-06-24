import { Router } from "express";
import { home } from "../controllers/marketplace.controller.js";

const router = Router();

router.get("/home", home);

export default router;
