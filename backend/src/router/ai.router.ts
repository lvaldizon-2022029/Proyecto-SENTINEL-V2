import { Request, Response, Router } from "express";
import { AiProviderError, aiService } from "../services/ai.service";
import { authenticate, validateAiQuery } from "./middleware";
import { AuthenticatedRequest } from "../models/types";

export const aiRouter = Router();
aiRouter.post("/consultar", authenticate, validateAiQuery, (req, res) => answerWithAi(req, res, "medical"));
aiRouter.post("/bienestar", authenticate, validateAiQuery, (req, res) => answerWithAi(req, res, "wellbeing"));

async function answerWithAi(req: Request, res: Response, mode: "medical" | "wellbeing") {
  const userId = Number(req.body.userId);
  const prompt = typeof req.body.prompt === "string" ? req.body.prompt.trim() : "";
  const authenticated = (req as Request & AuthenticatedRequest).user;
  if (authenticated && authenticated.rolUsers === "USER" && authenticated.idUsers !== userId) {
    return res.status(403).json({ error: "No puedes consultar la IA con los datos de otro usuario." });
  }
  try {
    return res.json(await aiService.answer(userId, prompt, mode));
  } catch (error) {
    console.error("SENTINEL AI request failed", error);
    if (error instanceof AiProviderError) return res.status(error.statusCode).json({ error: error.message });
    return res.status(502).json({ error: "No se pudo conectar con el servicio de IA." });
  }
}
