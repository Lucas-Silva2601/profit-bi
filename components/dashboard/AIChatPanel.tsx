"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

type Message = { role: "user" | "assistant"; content: string; timestamp: Date };

type Props = {
  datasetId: string;
  datasetName: string;
  onClose: () => void;
  onAction?: (action: any) => void;
  chartTitles?: string[];
};

export function AIChatPanel({
  datasetId,
  datasetName,
  onClose,
  onAction,
  chartTitles = [],
}: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá! Sou seu assistente de dados para **${datasetName}**. Pode me perguntar sobre tendências, totais, comparações ou qualquer insight sobre os seus dados.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyCleaned = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          question,
          history: historyCleaned,
          chartTitles,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido");

      let answerCleaned = data.answer;

      // Checa comandos Action com regex ES2015-safe
      const actionRegex = /<action>([\s\S]*?)<\/action>/g;
      let match;
      while ((match = actionRegex.exec(data.answer)) !== null) {
        try {
          const actionJson = JSON.parse(match[1]);
          if (onAction) onAction(actionJson);
        } catch (e) {
          console.error("Falha ao parsear ação da IA", match[1]);
        }
      }

      // Remove a tag de ação do texto exibido ao usuario
      answerCleaned = answerCleaned.replace(actionRegex, "").trim();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answerCleaned, timestamp: new Date() },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Erro: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    "Qual é o produto mais vendido?",
    "Qual mês teve maior faturamento?",
    "Me dê um resumo geral dos dados",
    "Quais são as 3 principais categorias?",
  ];

  const fmt = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="relative flex h-full w-full flex-col bg-white">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Chat com IA</h2>
            <p className="text-xs text-indigo-200">{datasetName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-indigo-600" : "border border-gray-200 bg-white shadow-sm"}`}
            >
              {msg.role === "user" ? (
                <User className="h-3.5 w-3.5 text-white" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-indigo-600" />
              )}
            </div>
            <div
              className={`flex max-w-[80%] flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-tr-sm bg-indigo-600 text-white"
                    : "rounded-tl-sm border border-gray-200 bg-white text-gray-800 shadow-sm"
                }`}
              >
                {/* Render bold markdown simplificado */}
                {msg.content
                  .split(/\*\*(.*?)\*\*/g)
                  .map((part, j) =>
                    j % 2 === 1 ? (
                      <strong key={j}>{part}</strong>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
              </div>
              <span className="mt-1 px-1 text-[10px] text-gray-400">
                {fmt(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
              <Bot className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (mostrado só na primeira mensagem) */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-1.5 bg-gray-50 px-4 pb-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(s);
                inputRef.current?.focus();
              }}
              className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-xs whitespace-nowrap text-indigo-700 transition-colors hover:bg-indigo-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex flex-shrink-0 items-center gap-2 border-t border-gray-200 bg-white px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Pergunte algo sobre os dados..."
          disabled={isLoading}
          className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
