import { Router } from "express";
import { recognizeFrame } from "../controllers/recognize.controller.js";

const router = Router();

router.post("/", recognizeFrame);

export default router;
