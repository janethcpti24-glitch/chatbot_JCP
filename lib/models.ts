// lib/models.ts
// Lista de modelos disponibles en el selector.
// Google retira modelos con frecuencia: si alguno devuelve 404,
// revisa https://ai.google.dev/gemini-api/docs/deprecations y actualiza esta lista.
export const AVAILABLE_MODELS = [
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash (Rápido y equilibrado)" },
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite (Más económico)" },
  { id: "gemini-flash-latest", label: "Flash Latest (alias al Flash vigente)" },
] as const;

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;
