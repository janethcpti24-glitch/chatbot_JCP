// app/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Message, ModelConfig } from "@/types/chat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ConfigPanel } from "@/components/ConfigPanel";
import { DEFAULT_MODEL } from "@/lib/models";
import { Bot, Trash2 } from "lucide-react";

const WELCOME: Message = {
  id: "welcome",
  role: "model",
  content:
    "¡Hola! Soy tu asistente basado en Gemini. Puedes ajustar mi contexto, longitud de respuesta y temperatura en el panel lateral.",
  timestamp: new Date(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ModelConfig>({
    modelName: DEFAULT_MODEL,
    systemInstruction: "Eres un tutor amigable y experto en ingeniería de software y programación.",
    temperature: 0.7,
    maxOutputTokens: 1024,
    topP: 0.95,
    topK: 40,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Solo turnos de usuario y modelo viajan al backend
      const payloadMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "model")
        .map((m) => ({ role: m.role as "user" | "model", content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages, config }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al comunicarse con el servidor");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: data.text,
          timestamp: new Date(),
        },
      ]);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: `⚠️ Error: ${msg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([{ ...WELCOME, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-dvh w-screen bg-slate-950 overflow-hidden font-sans">
      {/* Chat */}
      <div className="flex-1 flex flex-col min-h-0">
        <header className="h-16 shrink-0 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center justify-between backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-base">Gemini Software Dev Bot</h1>
              <p className="text-xs text-slate-400">Next.js + Google Gen AI SDK</p>
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            title="Limpiar conversación"
            aria-label="Limpiar conversación"
            className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 lg:px-12 py-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex gap-3 my-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      <ConfigPanel config={config} onChange={setConfig} />
    </div>
  );
}
