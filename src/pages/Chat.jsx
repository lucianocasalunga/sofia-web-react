import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Message from '../components/Message'
import { useAuth } from '../hooks/useAuth.jsx'
import { useChats } from '../hooks/useChats.jsx'

function WelcomeScreen({ onNew }) {
  const suggestions = [
    'Explique o protocolo Nostr',
    'Como funciona o Bitcoin Lightning?',
    'O que é descentralização?',
    'Me ajude a escrever um código Python',
  ]
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 overflow-hidden">
        <img src="/static/logo-sofia.png" className="w-14 h-14 object-contain" alt="Sofia" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Olá! Sou a Sofia</h2>
      <p className="text-slate-400 text-sm mb-8 max-w-xs">Inteligência descentralizada. Como posso te ajudar hoje?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {suggestions.map(s => (
          <button key={s} onClick={() => onNew(s)}
            className="text-left px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30 rounded-xl text-slate-300 text-sm transition-all">
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Chat() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { chats, activeChatId, messages, sending, loadingChats,
    loadChats, openChat, newChat, deleteChat, renameChat, sendMessage } = useChats()
  const [input, setInput] = useState('')
  const bottomRef = useRef()
  const textareaRef = useRef()

  useEffect(() => { loadChats() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleNew(initialText) {
    const chat = await newChat()
    if (initialText && chat) {
      setTimeout(() => sendMessage(initialText), 100)
    }
  }

  async function submit(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    if (!activeChatId) {
      const chat = await newChat()
      if (chat) setTimeout(() => sendMessage(text), 100)
    } else {
      sendMessage(text)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  function autoResize(e) {
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
    setInput(e.target.value)
  }

  return (
    <div className="flex h-screen bg-sofia-bg overflow-hidden">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        loadingChats={loadingChats}
        onNew={handleNew}
        onOpen={openChat}
        onDelete={deleteChat}
        onRename={renameChat}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-slate-800 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm font-medium">
              {activeChatId ? (chats.find(c => c.id === activeChatId)?.name || 'Conversa') : 'Sofia 5.0'}
            </span>
            <span className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">DeepSeek</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Online
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {!activeChatId || messages.length === 0 ? (
            <WelcomeScreen onNew={handleNew} />
          ) : (
            <>
              {messages.map(m => <Message key={m.id} msg={m} />)}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4 flex-shrink-0">
          <form onSubmit={submit} className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder="Mensagem para Sofia..."
              disabled={sending}
              className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none min-h-[46px] max-h-[180px] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-black flex items-center justify-center transition-colors flex-shrink-0"
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          <p className="text-xs text-slate-600 text-center mt-2">Sofia pode cometer erros. Verifique informações importantes.</p>
        </div>
      </div>
    </div>
  )
}
