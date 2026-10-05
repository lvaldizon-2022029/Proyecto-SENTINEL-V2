import { store } from "./store";

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
      ? `Eres el nucleo de inteligencia medica de SENTINEL en Guatemala. Responde unicamente sobre primeros auxilios y orientacion medica. En riesgo vital indica llamar al 123 o 122. No sustituyas a un medico. Se claro y breve.\n${context}`
      : `Eres el modulo de bienestar emocional de SENTINEL en Guatemala. Responde con empatia, apoyo psicologico inicial y tecnicas seguras. En crisis indica contactar servicios de emergencia. No sustituyas terapia profesional.\n${context}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    let response: Response;
    try {
      response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL ?? "qwen/qwen3.8-27b",
          temperature: 0.3,
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
