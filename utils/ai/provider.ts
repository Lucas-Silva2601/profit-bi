import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "@/env";

/**
 * Cliente da Ollama Cloud (API compatível com OpenAI em https://ollama.com/v1).
 *
 * A base URL é configurável — aponte para `http://localhost:11434/v1` para
 * testar com um Ollama local, sem custos.
 */
export const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: env.OLLAMA_BASE_URL,
  apiKey: env.OLLAMA_API_KEY,
});

/** Modelo padrão da Ollama Cloud (catálogo: https://ollama.com/search?c=cloud). */
export const ollamaModel = () => ollama(env.OLLAMA_MODEL);

/** true se a IA está configurada e pronta para uso. */
export function aiConfigured(): boolean {
  return !!env.OLLAMA_API_KEY && env.OLLAMA_API_KEY !== "dummy";
}
