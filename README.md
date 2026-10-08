# Chatterbot · Next.js + Google Gemini

Chatbot full-stack construido con **Next.js (App Router)**, **TypeScript** y **Tailwind CSS**, que usa el SDK oficial `@google/genai` desde el servidor. Incluye un panel para ajustar en tiempo real los parámetros del modelo: System Instruction, temperatura, tokens máximos de salida, Top-P y Top-K.

## Requisitos

- Node.js 20 o superior
- Una API key de Gemini (gratis en [Google AI Studio](https://aistudio.google.com/apikey))

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
# edita .env.local y pega tu GEMINI_API_KEY
npm run dev
```

Abre http://localhost:3000.

## Estructura

```
app/
  api/chat/route.ts   # Endpoint seguro: la API key nunca llega al navegador
  layout.tsx
  page.tsx            # Vista del chat y manejo de estado
components/
  ChatInput.tsx       # Enter envía, Shift+Enter salto de línea
  ChatMessage.tsx
  ConfigPanel.tsx     # Parámetros del modelo
lib/models.ts         # Lista de modelos del selector
types/chat.ts         # Tipos TypeScript
```

## Seguridad

- La clave vive en `.env.local`, que está en `.gitignore`.
- Nunca uses el prefijo `NEXT_PUBLIC_` para la API key.

## Modelos

Google retira modelos con frecuencia (los Gemini 1.5 y 2.5 ya no funcionan o están por apagarse). Si el chat responde con un error 404 de modelo, actualiza `lib/models.ts` con un modelo vigente: https://ai.google.dev/gemini-api/docs/deprecations

## Pruebas sugeridas

- **System Instruction**: pon "Responde únicamente en JSON con las claves `respuesta` y `lenguaje`" y pregunta "¿Cómo declaro una variable en Rust?".
- **maxOutputTokens**: baja el slider a 64 y pide una explicación larga. Nota: en los modelos Gemini 3 el "razonamiento" interno también consume tokens, así que con límites muy bajos la respuesta puede salir vacía o muy corta.
- **Temperatura**: compara 0.0 contra 1.8 pidiendo ideas de startups.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Chatbot con Next.js y Gemini"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```
