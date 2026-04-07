import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Key, Cpu, Signal, User, Zap, Diamond, Globe, Copy, Check, Menu, X, ArrowLeft } from "lucide-react"
import { useAuth } from "../components/auth/AuthContext"
import { SofiaLogo } from "../components/ui/sofia-logo"
import { getNostrProfile, truncateNpub, type NostrProfile } from "../lib/nostr-profile"
import * as api from "../lib/api"
import { RightSidebar } from "../components/layout/right-sidebar"

export default function SettingsPage() {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const [selectedModel, setSelectedModel] = useState("sofia-4")
  const [copied, setCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [nostrProfile, setNostrProfile] = useState<NostrProfile | null>(null)
  const [relays, setRelays] = useState([
    { url: "wss://relay.libernet.app", connected: true },
    { url: "wss://relay.damus.io", connected: true },
    { url: "wss://nos.lol", connected: false },
    { url: "wss://relay.primal.net", connected: true },
  ])
  const [newRelay, setNewRelay] = useState("")

  const [profile, setProfile] = useState({
    nome: "",
    npub: "",
    nip05: "",
    lightning: "",
    sobre: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const pubkey = api.getSavedPubkey()
    if (pubkey) {
      const np = await getNostrProfile(pubkey)
      setNostrProfile(np)
      setProfile({
        nome: np.display_name || np.name || currentUser?.name || "",
        npub: np.npub,
        nip05: np.nip05 || "",
        lightning: np.lud16 || "",
        sobre: np.about || "",
      })
    } else if (currentUser?.npub) {
      setProfile(p => ({ ...p, npub: currentUser.npub, nome: currentUser.name || "" }))
    }
  }

  const copyNpub = () => {
    navigator.clipboard.writeText(profile.npub)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addRelay = () => {
    if (newRelay && newRelay.startsWith("wss://")) {
      setRelays([...relays, { url: newRelay, connected: false }])
      setNewRelay("")
    }
  }

  const removeRelay = (url: string) => {
    setRelays(relays.filter((r) => r.url !== url))
  }

  const models = [
    { id: "sofia-4", name: "Sofia 4.0", subtitle: "Econômica para conversas rápidas", tokens: "300 tokens/msg", icon: Zap },
    { id: "sofia-5", name: "Sofia 5.0", subtitle: "Avançada para trabalho sério", tokens: "600 tokens/msg", icon: Diamond },
    { id: "sofia-5-plus", name: "Sofia 5.0+", subtitle: "Com acesso à internet em tempo real", tokens: "1,200 tokens/msg", icon: Globe },
  ]

  const userInitial = (nostrProfile?.name || currentUser?.name || "U").charAt(0).toUpperCase()

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      <div className="flex-1 overflow-y-auto">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10">
                <SofiaLogo className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white">Sofia</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </button>

            <nav className="hidden items-center gap-6 md:flex">
              <button onClick={() => navigate("/")} className="text-sm text-slate-400 transition-colors hover:text-white">Chat</button>
              <button onClick={() => navigate("/creditos")} className="text-sm text-slate-400 transition-colors hover:text-white">Créditos</button>
              <span className="border-b-2 border-emerald-500 pb-0.5 text-sm font-medium text-emerald-400">Configurações</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="md:hidden text-slate-400"><ArrowLeft className="h-5 w-5" /></button>
            <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-medium text-amber-400 md:flex overflow-hidden">
              {nostrProfile?.picture ? (
                <img src={nostrProfile.picture} alt="" className="w-full h-full object-cover" />
              ) : userInitial}
            </div>
            <button className="p-2 text-slate-400 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-800/60 bg-black/95 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <button onClick={() => navigate("/")} className="text-sm text-slate-400 text-left">Chat</button>
              <button onClick={() => navigate("/creditos")} className="text-sm text-slate-400 text-left">Créditos</button>
              <span className="text-sm font-medium text-emerald-400">Configurações</span>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-8">
          {/* Perfil Nostr */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Perfil Nostr</h2>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-[#111] p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-2xl font-bold text-amber-400 overflow-hidden">
                  {nostrProfile?.picture ? (
                    <img src={nostrProfile.picture} alt="" className="w-full h-full object-cover" />
                  ) : userInitial}
                </div>
                {nostrProfile?.nip05_verified && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">NIP-05 Verificado</span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">Nome</label>
                  <input type="text" value={profile.nome} onChange={(e) => setProfile({ ...profile, nome: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-[#0a0a0a] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-emerald-500/50 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">npub</label>
                  <div className="flex gap-2">
                    <input type="text" value={profile.npub} readOnly className="flex-1 rounded-xl border border-slate-700 bg-[#0a0a0a] px-4 py-2.5 font-mono text-sm text-slate-500" />
                    <button onClick={copyNpub} className="flex items-center justify-center rounded-xl border border-slate-700 bg-[#0a0a0a] px-3 text-slate-400 transition-colors hover:border-emerald-500/50 hover:text-emerald-400">
                      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">NIP-05</label>
                  <input type="text" value={profile.nip05} onChange={(e) => setProfile({ ...profile, nip05: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-[#0a0a0a] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-emerald-500/50 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-400"><Zap className="h-3.5 w-3.5" />Lightning Address</label>
                  <input type="text" value={profile.lightning} onChange={(e) => setProfile({ ...profile, lightning: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-[#0a0a0a] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-emerald-500/50 focus:outline-none" />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-slate-400">Sobre</label>
                  <textarea rows={3} value={profile.sobre} onChange={(e) => setProfile({ ...profile, sobre: e.target.value })} placeholder="Conte um pouco sobre você..." className="w-full resize-none rounded-xl border border-slate-700 bg-[#0a0a0a] px-4 py-2.5 text-white placeholder-slate-500 transition-colors focus:border-emerald-500/50 focus:outline-none" />
                </div>

                <div className="flex justify-end pt-2">
                  <button className="rounded-xl bg-emerald-500 px-6 py-2.5 font-medium text-black transition-colors hover:bg-emerald-400">Salvar Perfil</button>
                </div>
              </div>
            </div>
          </section>

          {/* Modelo de IA */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Modelo de IA</h2>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-[#111] p-4">
              <div className="space-y-3">
                {models.map((model) => {
                  const Icon = model.icon
                  const isSelected = selectedModel === model.id
                  return (
                    <button key={model.id} onClick={() => setSelectedModel(model.id)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${isSelected ? "border-emerald-500 bg-emerald-500/5" : "border-slate-700 hover:border-emerald-500/30"}`}>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? "border-emerald-500" : "border-slate-600"}`}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                      </div>
                      <Icon className={`h-5 w-5 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                      <div className="flex-1">
                        <div className="font-medium text-white">{model.name}</div>
                        <div className="text-sm text-slate-400">{model.subtitle}</div>
                      </div>
                      <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-400">{model.tokens}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Relays Nostr */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <Signal className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Relays Nostr</h2>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-[#111] p-4">
              <div className="mb-4 space-y-2">
                {relays.map((relay) => (
                  <div key={relay.url} className="flex items-center justify-between rounded-xl bg-[#0a0a0a] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${relay.connected ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-red-500"}`} />
                      <span className="font-mono text-sm text-slate-300">{relay.url}</span>
                    </div>
                    <button onClick={() => removeRelay(relay.url)} className="text-sm text-red-400 hover:text-red-300">Remover</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newRelay} onChange={(e) => setNewRelay(e.target.value)} placeholder="wss://..." className="flex-1 rounded-xl border border-slate-700 bg-[#0a0a0a] px-4 py-2.5 font-mono text-sm text-white placeholder-slate-500 transition-colors focus:border-emerald-500/50 focus:outline-none" />
                <button onClick={addRelay} className="rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-black transition-colors hover:bg-emerald-400">Adicionar</button>
              </div>
            </div>
          </section>

          {/* Conta */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Conta</h2>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-[#111] p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Plano</span>
                  <span className="rounded-lg bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">{currentUser?.plan || "free"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tokens restantes</span>
                  <span className="font-medium text-emerald-400">{currentUser?.token_balance ? currentUser.token_balance.toLocaleString("pt-BR") : "0"}</span>
                </div>
                <div className="border-t border-slate-800" />
                <div className="pt-2">
                  <button onClick={() => { logout(); navigate("/login") }} className="w-full rounded-xl border border-red-500/30 bg-transparent py-3 font-medium text-red-400 transition-colors hover:border-red-500/50 hover:bg-red-500/5">Sair</button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-sm text-slate-600">Sofia LiberNet v2.0 — Inteligência descentralizada</p>
        </footer>
      </main>
      </div>
      <RightSidebar />
    </div>
  )
}
