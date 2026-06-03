import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from '../components/Sidebar'
import { useChats } from '../hooks/useChats.jsx'

const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nos.lol',
  'wss://relay.libernet.app',
]

export default function Configuracoes() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { chats, activeChatId, loadingChats, loadChats, openChat, newChat, deleteChat, renameChat } = useChats()

  const [relays, setRelays]         = useState(DEFAULT_RELAYS)
  const [newRelay, setNewRelay]     = useState('')
  const [saved, setSaved]           = useState(false)

  useEffect(() => {
    loadChats()
    const stored = localStorage.getItem('sofia-relays')
    if (stored) try { setRelays(JSON.parse(stored)) } catch {}
  }, [])

  function saveRelays() {
    localStorage.setItem('sofia-relays', JSON.stringify(relays))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addRelay() {
    const url = newRelay.trim()
    if (!url || !url.startsWith('wss://')) return
    if (!relays.includes(url)) setRelays(prev => [...prev, url])
    setNewRelay('')
  }

  function removeRelay(r) {
    setRelays(prev => prev.filter(x => x !== r))
  }

  return (
    <div className="flex h-screen bg-sofia-bg overflow-hidden">
      <Sidebar chats={chats} activeChatId={activeChatId} loadingChats={loadingChats}
        onNew={newChat} onOpen={openChat} onDelete={deleteChat} onRename={renameChat} />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg">Configurações</h1>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

          {/* Perfil */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Perfil Nostr</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg flex-shrink-0">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{user?.name || 'Usuário'}</p>
                <p className="text-slate-400 text-xs truncate font-mono mt-0.5">{user?.npub || ''}</p>
                <p className="text-slate-500 text-xs mt-0.5">Plano: <span className="text-emerald-400 capitalize">{user?.plan || 'free'}</span></p>
              </div>
            </div>
          </div>

          {/* Relays */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">Relays Nostr</h2>
            <p className="text-slate-400 text-xs mb-4">Relays usados para buscar perfis e publicar eventos</p>

            <div className="space-y-2 mb-4">
              {relays.map(r => (
                <div key={r} className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <span className="text-slate-300 text-sm font-mono flex-1 truncate">{r}</span>
                  <button onClick={() => removeRelay(r)}
                    className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="wss://relay.example.com"
                value={newRelay}
                onChange={e => setNewRelay(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRelay()}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
              <button onClick={addRelay}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-colors">
                Adicionar
              </button>
            </div>

            <button onClick={saveRelays}
              className={`mt-4 w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                saved ? 'bg-emerald-500 text-black' : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}>
              {saved ? '✓ Salvo!' : 'Salvar Relays'}
            </button>
          </div>

          {/* Sobre */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Sobre</h2>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between"><span>Versão</span><span className="text-white">Sofia v2.0</span></div>
              <div className="flex justify-between"><span>Modelo</span><span className="text-white">DeepSeek Chat</span></div>
              <div className="flex justify-between"><span>Protocolo</span><span className="text-emerald-400">Nostr</span></div>
              <div className="flex justify-between"><span>Pagamentos</span><span className="text-amber-400">Lightning Network</span></div>
            </div>
          </div>

          {/* Sair */}
          <button onClick={() => { logout(); navigate('/') }}
            className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair da Conta
          </button>

        </div>
      </div>
    </div>
  )
}
