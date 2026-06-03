import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Sidebar from '../components/Sidebar'
import { useChats } from '../hooks/useChats.jsx'

const PACKAGES = [
  { id: 'starter',    name: 'Starter',    tokens: 500000,   sats: 500,   desc: '500k tokens' },
  { id: 'light',      name: 'Light',      tokens: 1000000,  sats: 900,   desc: '1M tokens' },
  { id: 'standard',   name: 'Standard',   tokens: 3000000,  sats: 2500,  desc: '3M tokens' },
  { id: 'pro',        name: 'Pro',        tokens: 10000000, sats: 7500,  desc: '10M tokens' },
]

function QRInvoice({ invoice, amount_sats, tokens, onPaid, onClose }) {
  const [checking, setChecking] = useState(false)
  const [copied, setCopied]     = useState(false)
  const intervalRef = useRef()

  useEffect(() => {
    if (!invoice?.payment_hash) return
    intervalRef.current = setInterval(async () => {
      try {
        const r = await api.checkPayment(invoice.payment_hash)
        if (r.paid) { clearInterval(intervalRef.current); onPaid(tokens) }
      } catch {}
    }, 3000)
    return () => clearInterval(intervalRef.current)
  }, [invoice])

  function copy() {
    navigator.clipboard.writeText(invoice.invoice)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">Pagamento Lightning</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-amber-400 mb-1">{amount_sats?.toLocaleString()} sats</p>
          <p className="text-slate-400 text-sm">{(tokens / 1000000).toFixed(1)}M tokens</p>
        </div>

        {/* QR placeholder - mostra bolt11 truncado */}
        <div className="bg-slate-800 rounded-xl p-4 mb-4 text-center">
          <div className="w-full aspect-square max-w-[200px] mx-auto bg-white rounded-lg flex items-center justify-center mb-3 p-2">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(invoice?.invoice || '')}`}
              alt="QR Code" className="w-full h-full object-contain rounded" />
          </div>
          <p className="text-xs text-slate-500 font-mono break-all leading-relaxed">
            {(invoice?.invoice || '').slice(0, 40)}...
          </p>
        </div>

        <div className="space-y-2">
          <button onClick={copy}
            className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? '✓ Copiado!' : 'Copiar Invoice'}
          </button>
          <a href={`lightning:${invoice?.invoice}`}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors flex items-center justify-center gap-2">
            ⚡ Abrir Carteira
          </a>
        </div>

        <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Aguardando pagamento...
        </p>
      </div>
    </div>
  )
}

export default function Creditos() {
  const navigate = useNavigate()
  const { chats, activeChatId, loadingChats, loadChats, openChat, newChat, deleteChat, renameChat } = useChats()
  const [balance, setBalance]       = useState(null)
  const [transactions, setTrans]    = useState([])
  const [loadingBal, setLoadingBal] = useState(true)
  const [invoice, setInvoice]       = useState(null)
  const [buying, setBuying]         = useState(null)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')

  useEffect(() => { loadChats(); loadBalance() }, [])

  async function loadBalance() {
    setLoadingBal(true)
    try {
      const [bal, txs] = await Promise.all([
        api.getBalance(),
        api.getTransactions().catch(() => ({ transactions: [] }))
      ])
      setBalance(bal.balance ?? 0)
      setTrans(txs.transactions || [])
    } catch {}
    finally { setLoadingBal(false) }
  }

  async function buy(pkg) {
    setError(''); setBuying(pkg.id)
    try {
      const data = await api.purchaseTokens(pkg.id)
      if (!data.success) throw new Error(data.error || 'Erro ao criar invoice')
      setInvoice({ invoice: data.invoice, payment_hash: data.payment_hash, tokens: data.tokens, amount_sats: data.amount_sats })
    } catch (e) {
      setError(e.message)
    } finally { setBuying(null) }
  }

  function onPaid(tokens) {
    setInvoice(null)
    setSuccess(`✓ ${(tokens / 1000000).toFixed(1)}M tokens adicionados com sucesso!`)
    loadBalance()
    setTimeout(() => setSuccess(''), 5000)
  }

  const tokensLeft = balance ?? 0
  const pct = Math.min(100, (tokensLeft / 10000) * 100)

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
          <h1 className="text-white font-bold text-lg">⚡ Tokens</h1>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

          {success && (
            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Saldo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-3">Seu Saldo</p>
            {loadingBal ? (
              <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
            ) : (
              <>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-bold text-white">
                    {tokensLeft >= 1000000
                      ? `${(tokensLeft / 1000000).toFixed(1)}M`
                      : tokensLeft >= 1000
                        ? `${(tokensLeft / 1000).toFixed(0)}k`
                        : tokensLeft.toLocaleString()}
                  </span>
                  <span className="text-slate-400 mb-1 text-sm">tokens</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-1">~{Math.floor(tokensLeft / 600)} mensagens restantes</p>
              </>
            )}
          </div>

          {/* Pacotes */}
          <div>
            <h2 className="text-white font-semibold mb-4">Adicionar Tokens</h2>
            <div className="grid grid-cols-2 gap-3">
              {PACKAGES.map(pkg => (
                <button key={pkg.id}
                  onClick={() => buy(pkg)}
                  disabled={!!buying}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 rounded-xl p-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <p className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{pkg.name}</p>
                  <p className="text-sm text-slate-400 mb-3">{pkg.desc}</p>
                  <div className="flex items-center gap-1 text-amber-400 font-semibold text-sm">
                    {buying === pkg.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    ) : '⚡'}
                    {pkg.sats.toLocaleString()} sats
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Histórico */}
          {transactions.length > 0 && (
            <div>
              <h2 className="text-white font-semibold mb-4">Histórico de Transações</h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {transactions.slice(0, 10).map((tx, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-800 last:border-0">
                    <div>
                      <p className="text-sm text-white">{tx.description || 'Transação'}</p>
                      <p className="text-xs text-slate-500">{tx.created_at ? new Date(tx.created_at).toLocaleDateString('pt-BR') : ''}</p>
                    </div>
                    <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{(tx.amount / 1000000).toFixed(1)}M
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {invoice && (
        <QRInvoice invoice={invoice} amount_sats={invoice.amount_sats} tokens={invoice.tokens}
          onPaid={onPaid} onClose={() => setInvoice(null)} />
      )}
    </div>
  )
}
