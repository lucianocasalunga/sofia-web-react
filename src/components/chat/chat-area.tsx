import { useState, useRef, useEffect } from "react"
import { Menu, Send } from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from "../auth/AuthContext"
import { SofiaLogo } from "../ui/sofia-logo"
import * as api from "../../lib/api"

interface ChatAreaProps {
  sidebarOpen: boolean
  onOpenSidebar: () => void
  selectedChat: string | null
  onChatCreated: (chatId: string) => void
}

const suggestionChips = [
  "Explicar Nostr",
  "Analisar código",
  "Criar conteúdo",
  "Configurar relay",
]

export function ChatArea({ sidebarOpen, onOpenSidebar, selectedChat, onChatCreated }: ChatAreaProps) {
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState<api.ChatMessage[]>([])
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || "U"

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px"
    }
  }, [message])

  // Load messages when chat changes
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat)
    } else {
      setMessages([])
    }
  }, [selectedChat])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadMessages = async (chatId: string) => {
    setIsLoadingMessages(true)
    const msgs = await api.getChatMessages(chatId)
    setMessages(msgs)
    setIsLoadingMessages(false)
  }

  const handleSend = async () => {
    const text = message.trim()
    if (!text || isSending) return

    let chatId = selectedChat

    // Auto-criar chat na primeira mensagem (estilo Claude)
    if (!chatId) {
      const chatName = text.length > 40 ? text.substring(0, 40) + "..." : text
      const newChat = await api.createChat(chatName)
      if (!newChat) return
      chatId = newChat.id
      onChatCreated(chatId)
    }

    // Mensagem otimista
    const userMsg: api.ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setMessage("")
    setIsSending(true)

    const response = await api.sendMessage(chatId, text)

    if (response) {
      setMessages(prev => [...prev, response])
    } else {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Desculpe, houve um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date().toISOString(),
      }])
    }

    setIsSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ========== EMPTY STATE ==========
  if (!selectedChat && messages.length === 0) {
    return (
      <main className="flex-1 flex flex-col bg-black min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={onOpenSidebar} className="w-8 h-8 rounded-lg hover:bg-slate-800/60 flex items-center justify-center transition-colors">
                <Menu className="w-5 h-5 text-slate-400" />
              </button>
            )}
            <span className="text-slate-400">Nova conversa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm text-slate-300">Sofia 5.0+</span>
          </div>
        </header>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
            <SofiaLogo className="w-12 h-12" />
          </div>
          <p className="text-slate-400 text-lg mb-8">Como posso ajudar?</p>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {suggestionChips.map((chip) => (
              <button
                key={chip}
                onClick={() => { setMessage(chip); textareaRef.current?.focus() }}
                className="px-4 py-3 rounded-xl border border-emerald-500/30 text-slate-300 hover:bg-emerald-500/10 transition-colors text-sm"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-800/60 flex-shrink-0">
          <div className="relative max-w-3xl mx-auto">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem para Sofia..."
              rows={1}
              className="w-full bg-[#111] border border-slate-700/50 focus:border-emerald-500/50 rounded-xl py-3 px-4 pr-12 text-white placeholder:text-slate-500 resize-none focus:outline-none transition-colors"
            />
            {message.trim() && (
              <button
                onClick={handleSend}
                className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">Sofia pode cometer erros. Verifique informações importantes.</p>
        </div>
      </main>
    )
  }

  // ========== CHAT WITH MESSAGES ==========
  return (
    <main className="flex-1 flex flex-col bg-black min-w-0">
      {/* Top bar */}
      <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button onClick={onOpenSidebar} className="w-8 h-8 rounded-lg hover:bg-slate-800/60 flex items-center justify-center transition-colors">
              <Menu className="w-5 h-5 text-slate-400" />
            </button>
          )}
          <span className="text-white font-medium truncate max-w-[200px] md:max-w-none">Conversa</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-sm text-slate-300">Sofia 5.0+</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 mx-auto w-full max-w-3xl">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 max-w-3xl", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
                msg.role === "assistant" ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-amber-500/20"
              )}>
                {msg.role === "assistant" ? (
                  <SofiaLogo className="w-4 h-4" />
                ) : (
                  <span className="text-amber-400 font-semibold text-sm">{userInitial}</span>
                )}
              </div>
              <div className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 max-w-[600px]",
                  msg.role === "assistant" ? "bg-slate-900/80 border border-slate-700/80" : "bg-amber-500/10 border border-amber-400/40"
                )}>
                  <div className={cn("text-sm whitespace-pre-wrap", msg.role === "assistant" ? "text-slate-200" : "text-slate-100")}>
                    <MessageContent content={msg.content} />
                  </div>
                </div>
                <span className={cn("text-xs mt-1", msg.role === "assistant" ? "text-slate-500" : "text-amber-500/60")}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isSending && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0">
              <SofiaLogo className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - INLINE, não componente separado */}
      <div className="p-4 border-t border-slate-800/60 flex-shrink-0">
        <div className="relative max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem para Sofia..."
            rows={1}
            disabled={isSending}
            className="w-full bg-[#111] border border-slate-700/50 focus:border-emerald-500/50 rounded-xl py-3 px-4 pr-12 text-white placeholder:text-slate-500 resize-none focus:outline-none transition-colors disabled:opacity-50"
          />
          {(message.trim() || isSending) && (
            <button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="absolute right-3 bottom-3 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 flex items-center justify-center transition-colors"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          )}
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">Sofia pode cometer erros. Verifique informações importantes.</p>
      </div>
    </main>
  )
}

// ============================================================================
// Message Content Parser
// ============================================================================

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const codeContent = part.replace(/```\w*\n?/, "").replace(/```$/, "")
          return (
            <pre key={i} className="bg-black rounded-lg p-3 my-2 overflow-x-auto">
              <code className="text-emerald-400 font-mono text-xs">{codeContent}</code>
            </pre>
          )
        }
        return (
          <span key={i}>
            {part.split("\n").map((line, j) => {
              const isBullet = line.startsWith("- ")
              const formattedLine = line
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 rounded text-emerald-300 font-mono text-xs">$1</code>')
              if (isBullet) {
                return (
                  <div key={j} className="flex gap-2 my-1">
                    <span className="text-emerald-400">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />
                  </div>
                )
              }
              return (
                <span key={j}>
                  <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
                  {j < part.split("\n").length - 1 && <br />}
                </span>
              )
            })}
          </span>
        )
      })}
    </>
  )
}

function formatTime(timestamp: string): string {
  if (!timestamp) return ""
  // Backend pode retornar "HH:MM" direto ou ISO string
  if (/^\d{1,2}:\d{2}$/.test(timestamp)) return timestamp
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return timestamp
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return timestamp
  }
}
