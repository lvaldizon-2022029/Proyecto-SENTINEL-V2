import { Request, Response, Router } from "express";
import { aiService } from "../services/ai.service";

export const aiRouter = Router();
aiRouter.post("/consultar", (req, res) => answerWithAi(req, res, "medical"));
aiRouter.post("/bienestar", (req, res) => answerWithAi(req, res, "wellbeing"));

async function answerWithAi(req: Request, res: Response, mode: "medical" | "wellbeing") {
  const userId = Number(req.body.userId);
  const prompt = typeof req.body.prompt === "string" ? req.body.prompt.trim() : "";
  if (!Number.isInteger(userId) || !prompt) return res.status(400).json({ error: "Los campos 'userId' y 'prompt' son obligatorios." });
  try {
    return res.json(await aiService.answer(userId, prompt, mode));
  } catch (error) {
    console.error("SENTINEL AI request failed", error);
    return res.status(502).json({ error: "No se pudo conectar con el servicio de IA." });
  }
}
