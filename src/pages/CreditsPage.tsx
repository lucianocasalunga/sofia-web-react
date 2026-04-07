import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Zap, Copy, X, Check, Menu, Loader2, ArrowLeft } from "lucide-react"
import { useAuth } from "../components/auth/AuthContext"
import { SofiaLogo } from "../components/ui/sofia-logo"
import { RightSidebar } from "../components/layout/right-sidebar"

const API_BASE = "/api"

function getToken() { return localStorage.getItem("sofia-auth-token") }
function authHeaders(): HeadersInit {
  const t = getToken()
  const h: HeadersInit = { "Content-Type": "application/json" }
  if (t) h["Authorization"] = `Bearer ${t}`
  return h
}

const packages = [
  { id: "light", name: "Light", price: 10, tokens: 1250000, messages: 4166 },
  { id: "standard", name: "Standard", price: 20, tokens: 2500000, messages: 8333, popular: true },
  { id: "pro", name: "Pro", price: 50, tokens: 6250000, messages: 20833 },
  { id: "enterprise", name: "Enterprise", price: 100, tokens: 12500000, messages: 41666 },
]

function formatNumber(num: number) {
  return num.toLocaleString("pt-BR")
}

interface Transaction {
  date: string
  type: string
  tokens: string
  sats: string
  status: string
  statusType: string
}

export default function CreditsPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState("standard")
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [invoice, setInvoice] = useState("")
  const [paymentHash, setPaymentHash] = useState("")
  const [satsAmount, setSatsAmount] = useState(0)
  const [usdAmount, setUsdAmount] = useState(0)
  const [balance, setBalance] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const [usedTokens, setUsedTokens] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  useEffect(() => {
    loadBalance()
    loadTransactions()
  }, [])

  const loadBalance = async () => {
    try {
      const resp = await fetch(`${API_BASE}/tokens/balance`, { headers: authHeaders() })
      if (resp.ok) {
        const data = await resp.json()
        setBalance(data.balance || 0)
        setTotalTokens((data.balance || 0) + (data.used || 0))
        setUsedTokens(data.used || 0)
      }
    } catch { /* */ }
  }

  const loadTransactions = async () => {
    try {
      const resp = await fetch(`${API_BASE}/tokens/transactions`, { headers: authHeaders() })
      if (resp.ok) {
        const data = await resp.json()
        if (Array.isArray(data)) {
          setTransactions(data.map((tx: Record<string, unknown>) => ({
            date: new Date(tx.created_at as string).toLocaleDateString("pt-BR"),
            type: tx.description as string || tx.transaction_type as string || "—",
            tokens: (tx.amount as number) > 0 ? `+${formatNumber(tx.amount as number)}` : formatNumber(tx.amount as number),
            sats: tx.amount_sats ? `${formatNumber(tx.amount_sats as number)} sats` : "—",
            status: tx.transaction_type === "recharge" ? "Pago" : tx.transaction_type === "usage" ? "Consumo" : "Bônus",
            statusType: tx.transaction_type as string || "usage",
          })))
        }
      }
    } catch { /* */ }
  }

  const handleBuy = async (pkgId: string) => {
    setSelectedPackage(pkgId)
    setCreatingInvoice(true)
    setShowModal(true)

    try {
      const pkg = packages.find(p => p.id === pkgId)
      const resp = await fetch(`${API_BASE}/tokens/purchase`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ plan: pkgId, amount_usd: pkg?.price }),
      })

      if (resp.ok) {
        const data = await resp.json()
        setInvoice(data.invoice || data.payment_request || "")
        setPaymentHash(data.payment_hash || "")
        setSatsAmount(data.amount_sats || 0)
        setUsdAmount(pkg?.price || 0)
      }
    } catch { /* */ }
    setCreatingInvoice(false)
  }

  const handleCopy = () => {
    if (invoice) navigator.clipboard.writeText(invoice)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleVerify = async () => {
    if (!paymentHash) return
    setVerifying(true)
    try {
      const resp = await fetch(`${API_BASE}/tokens/check-payment/${paymentHash}`, { headers: authHeaders() })
      if (resp.ok) {
        const data = await resp.json()
        if (data.paid || data.status === "paid") {
          // Creditar tokens
          await fetch(`${API_BASE}/tokens/credit`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ payment_hash: paymentHash }),
          })
          setShowModal(false)
          loadBalance()
          loadTransactions()
        }
      }
    } catch { /* */ }
    setVerifying(false)
  }

  const percentUsed = totalTokens > 0 ? Math.round((balance / totalTokens) * 100) : 100
  const circumference = 40 * 2 * Math.PI
  const strokeDash = `${(percentUsed / 100) * circumference} ${circumference}`

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      <div className="flex-1 overflow-y-auto">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/60 bg-[#0a0a0a]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-500 bg-black">
                <SofiaLogo className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0a] bg-emerald-500" />
              </div>
              <span className="text-lg font-semibold">Sofia</span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <button onClick={() => navigate("/")} className="text-gray-400 transition-colors hover:text-white">Chat</button>
              <span className="border-b-2 border-emerald-500 pb-0.5 text-white">Créditos</span>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-sm font-bold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <Menu className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-t border-slate-800/60 py-4 md:hidden">
              <div className="flex flex-col gap-4">
                <button onClick={() => navigate("/")} className="text-gray-400 text-left">Chat</button>
                <span className="text-emerald-400">Créditos</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Saldo */}
        <section className="mb-10 rounded-2xl border border-slate-800/60 bg-[#111] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-400">Seu Saldo</p>
              <p className="text-4xl font-bold text-white md:text-5xl">{formatNumber(balance)}</p>
              <p className="text-lg text-emerald-400">tokens</p>
              <p className="mt-2 text-sm text-gray-500">
                Equivale a ~{formatNumber(Math.round(balance / 300))} mensagens com Sofia 4.0
              </p>
            </div>

            <div className="relative h-32 w-32 flex-shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeDasharray={strokeDash} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{percentUsed}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percentUsed}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{formatNumber(usedTokens)} usados</span>
              <span>{formatNumber(totalTokens)} total</span>
            </div>
          </div>
        </section>

        {/* Pacotes */}
        <section className="mb-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Recarregar Tokens</h2>
            <p className="mt-1 flex items-center gap-2 text-gray-400">
              Pague com Bitcoin Lightning
              <Zap className="h-4 w-4 text-amber-400" />
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`relative rounded-xl border p-5 text-left transition-all ${
                  selectedPackage === pkg.id
                    ? "border-emerald-500 bg-emerald-500/5"
                    : pkg.popular
                    ? "border-emerald-500/30 bg-[#111] hover:border-emerald-500/50"
                    : "border-slate-700 bg-[#111] hover:border-emerald-500/50"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute right-3 top-3 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">POPULAR</span>
                )}
                <p className="font-semibold text-white">{pkg.name}</p>
                <p className="mt-1 text-2xl font-bold text-white">${pkg.price}</p>
                <p className="mt-2 text-emerald-400">{formatNumber(pkg.tokens)} tokens</p>
                <p className="text-sm text-gray-500">~{formatNumber(pkg.messages)} msgs</p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleBuy(pkg.id) }}
                  className={`mt-4 w-full rounded-lg border py-2 text-sm font-medium transition-colors ${
                    selectedPackage === pkg.id
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  Comprar
                </button>
              </button>
            ))}
          </div>
        </section>

        {/* Historico */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Histórico de Transações</h2>

          {transactions.length === 0 ? (
            <div className="rounded-xl border border-slate-800/60 bg-[#111] p-8 text-center text-gray-500">
              Nenhuma transação ainda
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-hidden rounded-xl border border-slate-800/60 md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/40 bg-[#0a0a0a]">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tokens</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sats</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#111]">
                    {transactions.map((tx, i) => (
                      <tr key={i} className="border-b border-slate-800/40 transition-colors hover:bg-slate-900/50">
                        <td className="px-4 py-3 text-sm text-gray-400">{tx.date}</td>
                        <td className="px-4 py-3 text-sm text-white">{tx.type}</td>
                        <td className={`px-4 py-3 text-sm ${tx.tokens.startsWith("+") ? "text-emerald-400" : "text-gray-400"}`}>{tx.tokens}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{tx.sats}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            tx.statusType === "recharge" ? "bg-emerald-500/20 text-emerald-400" :
                            tx.statusType === "bonus" ? "bg-emerald-500/20 text-emerald-400" :
                            "bg-slate-700 text-gray-400"
                          }`}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-3 md:hidden">
                {transactions.map((tx, i) => (
                  <div key={i} className="rounded-xl border border-slate-800/60 bg-[#111] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{tx.type}</p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.statusType === "recharge" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-gray-400"
                      }`}>{tx.status}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-sm font-medium ${tx.tokens.startsWith("+") ? "text-emerald-400" : "text-gray-400"}`}>{tx.tokens} tokens</span>
                      {tx.sats !== "—" && <span className="text-sm text-gray-500">{tx.sats}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-800/60 bg-[#111] p-6">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Pagamento Lightning</h3>
            </div>

            {creatingInvoice ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                <p className="mt-3 text-gray-400">Gerando invoice...</p>
              </div>
            ) : invoice ? (
              <>
                {/* QR placeholder - TODO: real QR */}
                <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-lg bg-white">
                  <p className="text-xs text-black text-center px-2">QR Code<br />(instale qrcode.react)</p>
                </div>

                <p className="mb-4 text-center text-sm text-gray-400">Escaneie com sua carteira Lightning</p>

                <div className="mb-4 flex items-center gap-2 rounded-lg bg-slate-900 p-3">
                  <code className="flex-1 truncate text-xs text-gray-400">{invoice.substring(0, 32)}...</code>
                  <button onClick={handleCopy} className="flex-shrink-0 text-gray-400 hover:text-white">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mb-2 text-center">
                  <p className="text-lg font-semibold text-white">{formatNumber(satsAmount)} sats</p>
                  <p className="text-sm text-gray-500">~${usdAmount} USD</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={handleCopy} className="flex-1 rounded-lg border border-emerald-500 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10">
                    {copied ? "Copiado!" : "Copiar Invoice"}
                  </button>
                  <button onClick={handleVerify} disabled={verifying} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-70">
                    {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                    {verifying ? "Verificando..." : "Verificar"}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-400 py-8">Erro ao gerar invoice. Tente novamente.</p>
            )}
          </div>
        </div>
      )}
      </div>
      <RightSidebar />
    </div>
  )
}
