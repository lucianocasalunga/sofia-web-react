import React, { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading = false }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto chat-scroll px-6 py-4 space-y-3"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center gap-3">
          <div className="px-4 py-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-300">
            Sofia LiberNet • Inteligência descentralizada. Liberdade conectada.
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h1 className="text-xl font-semibold text-slate-50 tracking-tight">
              Olá, eu sou a Sofia — sua IA autônoma da LiberNet.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Posso ajudar você a gerenciar servidores, tunéis, relays Nostr, automações com
              LNBits, Cloudflare, Docker, Nextcloud e todo o ecossistema LiberNet. Comece
              me contando o que você quer construir ou consertar hoje.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center">
                <span className="text-xs text-emerald-400">S</span>
              </div>
              <div className="max-w-xl rounded-2xl px-3 py-2.5 bg-slate-900/80 border border-slate-700/80 flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
