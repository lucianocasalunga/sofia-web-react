import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X, Plus, Search, MoreHorizontal, Trash2, Pencil, LogOut, Coins, CheckCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { useAuth } from "../auth/AuthContext"
import * as api from "../../lib/api"
import { SofiaLogo } from "../ui/sofia-logo"
import { getNostrProfile, truncateNpub, type NostrProfile } from "../../lib/nostr-profile"

interface ChatSidebarProps {
  isOpen: boolean
  onToggle: () => void
  selectedChat: string | null
  onSelectChat: (id: string | null) => void
  onNewChat: () => void
}

interface ChatGroup {
  label: string
  chats: api.Chat[]
}

function groupChatsByDate(chats: api.Chat[]): ChatGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: ChatGroup[] = [
    { label: "Hoje", chats: [] },
    { label: "Ontem", chats: [] },
    { label: "Últimos 7 dias", chats: [] },
    { label: "Anteriores", chats: [] },
  ]

  for (const chat of chats) {
    const chatDate = new Date(chat.created_at)
    if (chatDate >= today) groups[0].chats.push(chat)
    else if (chatDate >= yesterday) groups[1].chats.push(chat)
    else if (chatDate >= weekAgo) groups[2].chats.push(chat)
    else groups[3].chats.push(chat)
  }

  return groups.filter(g => g.chats.length > 0)
}

export function ChatSidebar({ isOpen, onToggle, selectedChat, onSelectChat, onNewChat }: ChatSidebarProps) {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [chats, setChats] = useState<api.Chat[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [nostrProfile, setNostrProfile] = useState<NostrProfile | null>(null)

  useEffect(() => {
    loadChats()
    loadNostrProfile()
  }, [])

  const loadChats = async () => {
    setIsLoading(true)
    const result = await api.listChats()
    setChats(result)
    setIsLoading(false)
  }

  const loadNostrProfile = async () => {
    const pubkey = api.getSavedPubkey()
    if (pubkey) {
      try {
        const profile = await getNostrProfile(pubkey)
        setNostrProfile(profile)
      } catch { /* */ }
    }
  }

  const handleNewChat = async () => {
    const chat = await api.createChat("Nova conversa")
    if (chat) {
      setChats(prev => [chat, ...prev])
      onSelectChat(chat.id)
      onNewChat()
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(null)
    // TODO: api.deleteChat(chatId) when endpoint is ready
    setChats(prev => prev.filter(c => c.id !== chatId))
    if (selectedChat === chatId) onSelectChat(null)
  }

  const filteredChats = searchQuery
    ? chats.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats

  const groupedChats = groupChatsByDate(filteredChats)

  const userName = currentUser?.name || "Usuário"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <>
      {/* Collapsed sidebar - icons only */}
      <div className={cn(
        "hidden md:flex flex-col w-16 bg-[#0a0a0a] border-r border-slate-800/60 transition-all duration-300",
        isOpen && "md:hidden"
      )}>
        <div className="p-3 flex flex-col items-center gap-4">
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
            title="Abrir menu"
          >
            <SofiaLogo className="w-5 h-5 text-emerald-400" />
          </button>

          <button
            onClick={handleNewChat}
            className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors"
            title="Nova conversa"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-xl bg-[#111] hover:bg-[#1a1a1a] flex items-center justify-center transition-colors border border-slate-800/60"
            title="Buscar conversas"
          >
            <Search className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="mt-auto p-3 flex flex-col items-center gap-3 border-t border-slate-800/60">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center" title={userName}>
            <span className="text-amber-400 font-semibold text-sm">{userInitial}</span>
          </div>
          <button
            onClick={logout}
            className="w-10 h-10 rounded-xl hover:bg-slate-800/60 flex items-center justify-center transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Full sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 h-full w-72 bg-[#0a0a0a] border-r border-slate-800/60 flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-0 md:border-0 md:overflow-hidden"
      )}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
              <SofiaLogo className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-white">Sofia</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <button
            onClick={onToggle}
            className="w-8 h-8 rounded-lg hover:bg-slate-800/60 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* New conversation */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Conversa
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full bg-[#111] border border-slate-800/60 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white0 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {isLoading ? (
            <div className="text-center text-white0 text-sm py-8">Carregando...</div>
          ) : groupedChats.length === 0 ? (
            <div className="text-center text-white0 text-sm py-8">
              {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </div>
          ) : (
            groupedChats.map((group) => (
              <div key={group.label} className="mb-4">
                <h3 className="text-xs font-medium text-white0 uppercase tracking-wider px-2 mb-2">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={cn(
                        "relative group rounded-lg transition-colors cursor-pointer",
                        selectedChat === chat.id
                          ? "bg-emerald-500/15 border-l-2 border-emerald-500"
                          : "hover:bg-emerald-500/10"
                      )}
                      onMouseEnter={() => setHoveredChat(chat.id)}
                      onMouseLeave={() => { setHoveredChat(null); setMenuOpen(null) }}
                      onClick={() => onSelectChat(chat.id)}
                    >
                      <div className="py-2.5 px-3 flex items-center justify-between">
                        <span className="text-sm text-white truncate flex-1 pr-2">
                          {chat.name}
                        </span>
                        {hoveredChat === chat.id ? (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setMenuOpen(menuOpen === chat.id ? null : chat.id)
                              }}
                              className="w-6 h-6 rounded hover:bg-slate-700/50 flex items-center justify-center"
                            >
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </button>
                            {menuOpen === chat.id && (
                              <div className="absolute right-0 top-full mt-1 w-36 bg-[#111] border border-slate-800 rounded-lg py-1 shadow-xl z-10">
                                <button className="w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/60 flex items-center gap-2">
                                  <Pencil className="w-3.5 h-3.5" />
                                  Renomear
                                </button>
                                <button
                                  onClick={(e) => handleDeleteChat(chat.id, e)}
                                  className="w-full px-3 py-2 text-sm text-red-400 hover:bg-slate-800/60 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom user section - Nostr Profile */}
        <div className="p-3 border-t border-slate-800/60 space-y-3">
          {/* Avatar + Name + npub */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-amber-500/20 flex items-center justify-center">
              {nostrProfile?.picture ? (
                <img
                  src={nostrProfile.picture}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                <span className="text-amber-400 font-semibold">{userInitial}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-white font-medium truncate">
                  {nostrProfile?.display_name || nostrProfile?.name || userName}
                </p>
                {nostrProfile?.nip05_verified && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-white0 font-mono truncate">
                {nostrProfile ? truncateNpub(nostrProfile.npub) : currentUser?.npub ? truncateNpub(currentUser.npub) : ""}
              </p>
            </div>
          </div>

          {/* NIP-05 */}
          {nostrProfile?.nip05 && (
            <p className="text-[11px] text-emerald-400/70 truncate px-1">
              {nostrProfile.nip05}
            </p>
          )}

          {/* Badges */}
          {nostrProfile?.badges && nostrProfile.badges.length > 0 && (
            <div className="flex gap-1 px-1 flex-wrap">
              {nostrProfile.badges.slice(0, 5).map((badge, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400" title={badge.name || badge.id}>
                  {badge.thumb ? (
                    <img src={badge.thumb} alt="" className="w-3 h-3 rounded-full" />
                  ) : null}
                  {badge.name || "badge"}
                </span>
              ))}
            </div>
          )}

          {/* Credits + Actions */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => navigate("/creditos")}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{currentUser?.token_balance ? `${(currentUser.token_balance / 1000).toFixed(0)}K tokens` : "0 tokens"}</span>
            </button>
            <button
              onClick={logout}
              className="w-7 h-7 rounded-lg hover:bg-slate-800/60 flex items-center justify-center transition-colors"
              title="Sair"
            >
              <LogOut className="w-3.5 h-3.5 text-white0" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
