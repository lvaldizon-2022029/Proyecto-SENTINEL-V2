import { store } from "./store";
import { AI_CONFIG } from "../config/constants";

export class AiProviderError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = "AiProviderError";
  }
}

export class AiService {
  async answer(userId: number, prompt: string, mode: "medical" | "wellbeing") {
    const apiKey = mode === "medical"
      ? process.env.GROQ_API_KEY
      : process.env.GROQ_API_KEY_2 ?? process.env.GROQ_API_KEY;
    if (!apiKey) throw new AiProviderError("GROQ_API_KEY no esta configurada.", 503);

    const user = await store.findUser(userId);
    const vital = (await store.collection("vitalData")).find((item) => item.id === userId || item.idUser === userId);
    const context = `Nombre: ${user?.nombreUsers ?? "No disponible"}\nDatos vitales: ${vital ? JSON.stringify(vital) : "No registrados"}`;
    const system = mode === "medical"
      ? AI_CONFIG.medicalSystemPrompt.replace("{bomberos}", AI_CONFIG.emergencyNumbers.bomberos).replace("{policia}", AI_CONFIG.emergencyNumbers.policia) + `\n${context}`
      : AI_CONFIG.wellbeingSystemPrompt + `\n${context}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);
    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          temperature: AI_CONFIG.temperature,
          messages: [{ role: "system", content: system }, { role: "user", content: prompt }]
        })
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new AiProviderError("El proveedor de IA tardo demasiado en responder.", 504);
      }
      throw new AiProviderError("No se pudo establecer conexion con el proveedor de IA.", 503);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let providerMessage = "";
      try {
        const errorBody = await response.json() as { error?: { message?: string } };
        providerMessage = errorBody.error?.message ?? "";
      } catch {
        providerMessage = "";
      }
      console.error(`SENTINEL AI provider returned ${response.status}${providerMessage ? `: ${providerMessage}` : ""}`);
      throw new AiProviderError(`El proveedor de IA respondio con HTTP ${response.status}.`, response.status === 429 ? 429 : 503);
    }

    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { respuesta: body.choices?.[0]?.message?.content ?? "La IA no devolvio una respuesta valida." };
  }
}

export const aiService = new AiService();
