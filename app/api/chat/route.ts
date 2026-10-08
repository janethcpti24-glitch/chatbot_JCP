// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { ChatRequestBody } from "@/types/chat";
import { DEFAULT_MODEL } from "@/lib/models";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("ADVERTENCIA: GEMINI_API_KEY no está configurada en .env.local");
}

// El cliente vive solo en el servidor: la clave nunca llega al navegador.
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(Math.max(n, min), max);
};

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: "La API Key de Gemini no está configurada en el servidor." },
        { status: 500 }
      );
    }

    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "El cuerpo de la solicitud no es JSON válido." }, { status: 400 });
    }

    const { messages, config } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "El historial de mensajes no puede estar vacío." },
        { status: 400 }
      );
    }

    // Gemini exige que el historial empiece con un turno del usuario
    // (el saludo inicial del bot se descarta).
    const firstUser = messages.findIndex((m) => m.role === "user");
    if (firstUser === -1) {
      return NextResponse.json({ error: "Debe haber al menos un mensaje del usuario." }, { status: 400 });
    }

    const contents = messages.slice(firstUser).map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: String(m.content ?? "") }],
    }));

    const response = await ai.models.generateContent({
      model: config?.modelName || DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction: config?.systemInstruction?.trim() || undefined,
        temperature: clamp(config?.temperature, 0, 2, 0.7),
        maxOutputTokens: Math.round(clamp(config?.maxOutputTokens, 16, 8192, 1024)),
        topP: clamp(config?.topP, 0, 1, 0.95),
        topK: Math.round(clamp(config?.topK, 1, 100, 40)),
      },
    });

    return NextResponse.json({
      text: response.text || "Sin respuesta generada por el modelo.",
      usageMetadata: response.usageMetadata,
    });
  } catch (error: unknown) {
    console.error("Error en /api/chat:", error);
    const message =
      error instanceof Error ? error.message : "Ocurrió un error al procesar la solicitud con Gemini.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
