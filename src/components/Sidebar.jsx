import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ChatItem({ chat, active, onOpen, onDelete, onRename }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(chat.name)
  const [hover, setHover] = useState(false)

  const submit = () => { setEditing(false); if (name.trim()) onRename(chat.id, name.trim()) }

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm ${
        active ? 'bg-emerald-500/15 border border-emerald-500/30 text-white' : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => !editing && onOpen(chat.id)}
    >
      <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {editing ? (
        <input
          autoFocus
          className="flex-1 bg-transparent outline-none text-white text-sm min-w-0"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={submit}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setEditing(false) }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate">{chat.name || 'Nova Conversa'}</span>
      )}
      {(hover || active) && !editing && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            onClick={e => { e.stopPropagation(); setEditing(true) }}
            title="Renomear"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            onClick={e => { e.stopPropagation(); onDelete(chat.id) }}
            title="Excluir"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ chats, activeChatId, loadingChats, onNew, onOpen, onDelete, onRename }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')

  const filtered = chats.filter(c =>
    !search || (c.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const navBtn = (path, label, icon) => (
    <button
      onClick={() => navigate(path)}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm transition-colors ${
        location.pathname === path
          ? 'bg-slate-700/60 text-white'
          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <div className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen">

      {/* Logo */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/static/logo-sofia.png" className="w-8 h-8 object-contain" alt="Sofia" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base">Sofia</span>
              <span className="relative flex h-2 w-2">
                <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-xs text-slate-500">LiberNet · v2.0</span>
          </div>
        </div>
      </div>

      {/* Botão Adicionar Tokens */}
      <div className="px-3 pb-2">
        <button
          onClick={() => navigate('/creditos')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-colors"
        >
          ⚡ Adicionar Tokens
        </button>
      </div>

      {/* Nova Conversa */}
      <div className="px-3 pb-2">
        <button
          onClick={() => { onNew(); navigate('/chat') }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Conversa
        </button>
      </div>

      {/* Busca */}
      <div className="px-3 pb-2">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            placeholder="Buscar conversas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de chats */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-2">
        {loadingChats ? (
          <div className="flex items-center justify-center py-8 text-slate-500 text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500 text-xs text-center px-4">
            <svg className="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </div>
        ) : filtered.map(c => (
          <ChatItem
            key={c.id}
            chat={c}
            active={c.id === activeChatId}
            onOpen={onOpen}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}
      </div>

      {/* Nav bottom */}
      <div className="border-t border-slate-800 px-3 py-3 space-y-1">
        {navBtn('/configuracoes', 'Configurações',
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}

        {/* User info */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-bold flex-shrink-0">
            {(user?.name || user?.npub || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-300 truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.plan === 'free' ? 'Plano Gratuito' : user?.plan}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition-colors" title="Sair">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
