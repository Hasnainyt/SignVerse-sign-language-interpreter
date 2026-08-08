import express from "express";
import cors from "cors";

import translateRouter from "./routes/translate.routes.js";
import recognizeRouter from "./routes/recognize.routes.js";
import ttsRouter from "./routes/tts.routes.js";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : "*";

app.use(cors({
  origin: allowedOrigins
}));

app.use(express.json({ limit: "25mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "signVerse backend is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/translate", translateRouter);
app.use("/api/recognize", recognizeRouter);
app.use("/api/tts", ttsRouter);

export default app;