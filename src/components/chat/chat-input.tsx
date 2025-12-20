import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-800/80 bg-slate-950/80">
      <div className="max-w-4xl mx-auto px-4 py-3 space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-2 flex-1">
            <textarea
              className="w-full resize-none rounded-2xl bg-slate-900/80 border border-slate-800/90 focus:outline-none focus:ring-1 focus:ring-emerald-500/80 focus:border-emerald-500/60 text-sm text-slate-50 placeholder:text-slate-500 px-3 py-2.5 chat-scroll"
              rows={2}
              placeholder="Escreva aqui o que você quer que a Sofia faça..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>
                Enter para enviar • Shift+Enter para quebrar linha
              </span>
              <span className="text-slate-600">Sofia • GPT-4o</span>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="w-10 h-10 rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
