import { useState, useCallback } from 'react'
import { api } from '../api/client'

export function useChats() {
  const [chats, setChats]           = useState([])
  const [activeChatId, setActive]   = useState(null)
  const [messages, setMessages]     = useState([])
  const [sending, setSending]       = useState(false)
  const [loadingChats, setLoadingChats] = useState(false)

  const loadChats = useCallback(async () => {
    setLoadingChats(true)
    try {
      const data = await api.listChats()
      setChats(Array.isArray(data) ? data : [])
    } catch {}
    finally { setLoadingChats(false) }
  }, [])

  const openChat = useCallback(async (id) => {
    setActive(id)
    setMessages([])
    try {
      const data = await api.getChat(id)
      setMessages(data.messages || [])
    } catch {}
  }, [])

  const newChat = useCallback(async () => {
    try {
      const chat = await api.createChat('Nova Conversa')
      setChats(prev => [chat, ...prev])
      setActive(chat.id)
      setMessages([])
      return chat
    } catch {}
  }, [])

  const deleteChat = useCallback(async (id) => {
    await api.deleteChat(id)
    setChats(prev => prev.filter(c => c.id !== id))
    if (activeChatId === id) { setActive(null); setMessages([]) }
  }, [activeChatId])

  const renameChat = useCallback(async (id, name) => {
    await api.renameChat(id, name)
    setChats(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }, [])

  const sendMessage = useCallback(async (text) => {
    if (!activeChatId || sending || !text.trim()) return

    // Mensagem do usuário imediatamente
    const userMsg = { id: Date.now(), role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setSending(true)

    // Placeholder "digitando"
    const thinkId = Date.now() + 1
    setMessages(prev => [...prev, { id: thinkId, role: 'thinking' }])

    try {
      const resp = await api.sendMessage(activeChatId, text)
      setMessages(prev => prev
        .filter(m => m.id !== thinkId)
        .concat({ id: resp.id || Date.now() + 2, role: 'assistant', content: resp.content, timestamp: resp.timestamp })
      )
      // Atualiza nome do chat se for primeira mensagem
      setChats(prev => prev.map(c =>
        c.id === activeChatId ? { ...c, last_message: text.slice(0, 50) } : c
      ))
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== thinkId))
      const errMsg = err.message || 'Erro ao enviar mensagem'
      const isTokens = errMsg.includes('tokens') || err.status === 402
      setMessages(prev => [...prev, {
        id: Date.now() + 3,
        role: 'error',
        content: isTokens ? 'Saldo de tokens insuficiente. [Adicionar tokens →](/creditos)' : errMsg
      }])
    } finally {
      setSending(false)
    }
  }, [activeChatId, sending])

  return { chats, activeChatId, messages, sending, loadingChats, loadChats, openChat, newChat, deleteChat, renameChat, sendMessage, setActive }
}
