import React from "react";
import type { ChatMessage } from "./chat-view";
import { SofiaLogo } from "../ui/sofia-logo";
import { useAuth } from "../auth/AuthContext";

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { currentUser } = useAuth();
  const isUser = message.role === "user";
  const initial = isUser
    ? (currentUser?.name?.charAt(0)?.toUpperCase() ?? "U")
    : "S";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center">
          <SofiaLogo className="w-4 h-4 text-emerald-400" />
        </div>
      )}
      <div
        className={`max-w-xl rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-amber-500/10 border border-amber-400/40 text-amber-50"
            : "bg-slate-900/80 border border-slate-700/80 text-slate-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={`mt-1.5 block text-[10px] ${
            isUser ? "text-amber-300/70" : "text-slate-400/70"
          }`}
        >
          {message.timestamp}
        </span>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-xs font-semibold text-amber-200">
          {initial}
        </div>
      )}
    </div>
  );
};
