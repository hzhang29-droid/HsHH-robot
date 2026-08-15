import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { ZodError } from "zod";
import { analyzePet } from "./pet-analyzer.js";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.resolve(backendRoot, "../.env") });
dotenv.config({ path: path.resolve(backendRoot, ".env") });

const app = express();
const port = Number(process.env.PORT || 8787);
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, done) => {
    done(allowedTypes.has(file.mimetype) ? null : new Error("UNSUPPORTED_IMAGE_TYPE"), allowedTypes.has(file.mimetype));
  }
});

app.disable("x-powered-by");
const configuredOrigins = (process.env.WEB_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin(origin, done) {
    const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
    if (!origin || isLocalDev || configuredOrigins.includes(origin)) return done(null, true);
    return done(new Error("ORIGIN_NOT_ALLOWED"));
  }
}));
app.use(express.json({ limit: "256kb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    visionMode: process.env.OPENAI_API_KEY ? "openai" : "mock",
    tuyaConfigured: Boolean(process.env.TUYA_ACCESS_ID && process.env.TUYA_ACCESS_SECRET)
  });
});

app.post("/api/pets/analyze", upload.single("photo"), async (request, response, next) => {
  try {
    if (!request.file) return response.status(400).json({ error: "PHOTO_REQUIRED", message: "请上传宠物照片。" });

    const result = await analyzePet({
      buffer: request.file.buffer,
      mimeType: request.file.mimetype,
      speciesHint: request.body.speciesHint,
      breedHint: request.body.breedHint
    });

    response.json({
      petId: `pet_${crypto.randomUUID()}`,
      mode: result.mode,
      identity: result.identity,
      needsReview: result.mode === "mock" || result.identity.confidence < 0.72
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/pets/render", (_request, response) => {
  response.status(501).json({
    error: "RENDERER_NOT_IMPLEMENTED",
    message: "照片分析已可用；参数化 SVG 表情渲染器仍需根据设计源文件实现。"
  });
});

app.post("/api/tuya/devices/:deviceId/sync", (_request, response) => {
  response.status(501).json({
    error: "TUYA_NOT_CONFIGURED",
    message: "请先完成表情资源包生成并配置 Tuya Cloud 项目。"
  });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return response.status(413).json({ error: "PHOTO_TOO_LARGE", message: "图片不能超过 10MB。" });
  }
  if (error.message === "UNSUPPORTED_IMAGE_TYPE") {
    return response.status(415).json({ error: "UNSUPPORTED_IMAGE_TYPE", message: "只支持 JPEG、PNG 或 WebP。" });
  }
  if (error instanceof ZodError) {
    return response.status(502).json({ error: "INVALID_MODEL_OUTPUT", message: "视觉模型返回的数据格式不正确。" });
  }
  response.status(500).json({ error: "INTERNAL_ERROR", message: "服务器处理失败，请稍后重试。" });
});

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`HsHH backend listening on http://localhost:${port}`);
    console.log(`Vision mode: ${process.env.OPENAI_API_KEY ? "OpenAI" : "mock"}`);
  });
}

export default app;
