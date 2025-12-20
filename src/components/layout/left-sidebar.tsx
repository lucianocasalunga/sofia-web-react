import React, { useEffect, useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { SofiaLogo } from "../ui/sofia-logo";
import { useAuth } from "../auth/AuthContext";
import * as api from "../../lib/api";

interface LeftSidebarProps {
  onChatSelect?: (chatId: string) => void;
  onNewChat?: () => void;
  selectedChatId?: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onChatSelect, onNewChat, selectedChatId }) => {
  const { currentUser, logout } = useAuth();
  const [chats, setChats] = useState<api.Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    setIsLoading(true);
    const result = await api.listChats();
    setChats(result);
    setIsLoading(false);
  };

  const handleNewChat = async () => {
    const name = prompt("Nome do novo chat:");
    if (!name) return;

    const chat = await api.createChat(name);
    if (chat) {
      setChats(prev => [chat, ...prev]);
      onNewChat?.();
      onChatSelect?.(chat.id);
    }
  };

  return (
    <aside className="h-full w-72 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SofiaLogo className="w-7 h-7" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              Sofia LiberNet
            </span>
            <span className="text-xs text-emerald-400/80">
              Inteligência descentralizada
            </span>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="p-2 rounded-full hover:bg-slate-800/80 transition-colors"
          title="Novo chat"
        >
          <Plus className="w-4 h-4 text-slate-300" />
        </button>
      </div>

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto chat-scroll px-3 py-3 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400/80">
              <MessageSquare className="w-3 h-3" />
              Conversas
            </div>
          </div>

          {isLoading ? (
            <div className="text-xs text-slate-500 px-2">Carregando...</div>
          ) : chats.length === 0 ? (
            <div className="text-xs text-slate-500 px-2">Nenhum chat ainda</div>
          ) : (
            <nav className="space-y-1.5">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect?.(chat.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg border transition-colors flex flex-col gap-0.5 ${
                    selectedChatId === chat.id
                      ? 'bg-slate-800/90 border-emerald-500/60'
                      : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-50 line-clamp-1">
                      {chat.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {chat.tokens_used} / {chat.limit} tokens
                  </span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xs font-semibold text-amber-300">
            {currentUser?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-50">
              {currentUser?.name ?? "Usuário"}
            </span>
            <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
              {currentUser?.plan ?? "free"}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-[11px] text-slate-500 hover:text-slate-200 transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  );
};
