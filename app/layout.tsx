import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chatterbot · Next.js + Gemini",
  description:
    "Chatbot con Next.js y la API de Google Gemini, con parámetros del modelo ajustables.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
