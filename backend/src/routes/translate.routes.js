import { Router } from "express";
import { translateText } from "../controllers/translate.controller.js";

const router = Router();

router.post("/", translateText);

export default router;
