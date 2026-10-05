import { store } from "./store";

export class AiService {
  async answer(userId: number, prompt: string, mode: "medical" | "wellbeing") {
    const apiKey = mode === "medical" ? process.env.GROQ_API_KEY : process.env.GROQ_API_KEY_2 ?? process.env.GROQ_API_KEY;
    if (!apiKey) return { respuesta: mode === "medical" ? "Sentinel AI: Configure GROQ_API_KEY para habilitar la orientación médica." : "Asistente SENTINEL: Configure GROQ_API_KEY_2 para habilitar el soporte emocional." };
    const user = await store.findUser(userId);
    const vital = (await store.collection("vitalData")).find((item) => item.id === userId);
    const context = `Nombre: ${user?.nombreUsers ?? "No disponible"}\nDatos vitales: ${vital ? JSON.stringify(vital) : "No registrados"}`;
    const system = mode === "medical"
      ? `Eres el Núcleo de Inteligencia Médica de SENTINEL en Guatemala. Responde únicamente sobre primeros auxilios y orientación médica. En riesgo vital indica llamar al 123 o 122. No sustituyas a un médico. Sé claro y breve.\n${context}`
      : `Eres el módulo de bienestar emocional de SENTINEL en Guatemala. Responde con empatía, apoyo psicológico inicial y técnicas seguras. En crisis indica contactar servicios de emergencia. No sustituyas terapia profesional.\n${context}`;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: system }, { role: "user", content: prompt }] })
    });
    if (!response.ok) throw new Error("El proveedor de IA no está disponible.");
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return { respuesta: body.choices?.[0]?.message?.content ?? "La IA no devolvió una respuesta válida." };
  }
}

export const aiService = new AiService();
