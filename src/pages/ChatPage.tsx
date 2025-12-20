import React, { useState, useEffect } from "react";
import { LeftSidebar } from "../components/layout/left-sidebar";
import { RightSidebar } from "../components/layout/right-sidebar";
import { ChatView, ChatMessage } from "../components/chat/chat-view";
import { ChatInput } from "../components/chat/chat-input";
import * as api from "../lib/api";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    }
  }, [currentChatId]);

  const loadMessages = async (chatId: string) => {
    const msgs = await api.getChatMessages(chatId);
    setMessages(msgs);
  };

  const handleSend = async (content: string) => {
    if (!currentChatId) {
      // Se não houver chat ativo, criar um novo
      const chatName = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      const newChat = await api.createChat(chatName);
      if (!newChat) {
        alert('Erro ao criar chat');
        return;
      }
      setCurrentChatId(newChat.id);
      // A mensagem será enviada após o chat ser criado
      await sendMessageToChat(newChat.id, content);
      return;
    }

    await sendMessageToChat(currentChatId, content);
  };

  const sendMessageToChat = async (chatId: string, content: string) => {
    // Adicionar mensagem do usuário imediatamente
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    // Enviar para backend
    const response = await api.sendMessage(chatId, content);
    setIsSending(false);

    if (response) {
      setMessages(prev => [...prev, response]);
    } else {
      // Erro ao enviar - mostrar mensagem de erro
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  return (
    <div className="h-screen w-screen sofia-gradient flex overflow-hidden">
      <LeftSidebar
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        selectedChatId={currentChatId || undefined}
      />
      <main className="flex-1 flex flex-col border-x border-slate-800/80 bg-slate-950/70">
        <header className="h-10 border-b border-slate-800/80 flex items-center justify-between px-4 text-xs text-slate-400 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sofia • Online • GPT-4o</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {currentChatId ? 'Chat ativo' : 'Nenhum chat selecionado'}
          </span>
        </header>
        <ChatView messages={messages} isLoading={isSending} />
        <ChatInput onSend={handleSend} disabled={isSending} />
      </main>
      <RightSidebar />
    </div>
  );
};

export default ChatPage;
