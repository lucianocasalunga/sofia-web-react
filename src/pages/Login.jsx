import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

function MatrixBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isMobile || prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const fontSize = 14
    const cols = Math.floor(canvas.width / fontSize)
    const drops = []
    for (let i = 0; i < cols; i++) drops[i] = Math.random() * -100

    let raf
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize
        const alpha = Math.random() * 0.5 + 0.1
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
        ctx.fillText(char, x, y)
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.5
      }
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
    />
  )
}

export default function Login() {
  const { loginExtension, loginNsec } = useAuth()
  const navigate = useNavigate()
  // 'menu' | 'nsec'
  const [view, setView]         = useState('menu')
  const [nsec, setNsec]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showNsec, setShowNsec] = useState(false)

  const hasExtension = typeof window !== 'undefined' && !!window.nostr

  async function handleExtension() {
    setError(''); setLoading(true)
    try {
      await loginExtension()
      navigate('/chat')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  async function handleNsec(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await loginNsec(nsec.trim())
      navigate('/chat')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-sofia-bg flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.08) 0%, #020617 60%)' }}>
      <MatrixBackground />

      <div className="w-full max-w-sm" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 shadow-[0_0_40px_-8px_rgba(16,185,129,0.4)] overflow-hidden">
            <img src="/static/logo-sofia.png" className="w-16 h-16 object-contain" alt="Sofia" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Sofia LiberNet</h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-slate-400 text-sm text-center">Inteligência descentralizada. Liberdade conectada.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl">

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {view === 'menu' ? (
            <div className="space-y-3">
              {/* Entrar com Extensão */}
              <button
                onClick={handleExtension}
                disabled={loading || !hasExtension}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  hasExtension
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                    : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {loading ? 'Conectando...' : 'Entrar com Extensão'}
              </button>
              {!hasExtension && (
                <p className="text-center text-xs text-slate-500 -mt-1">
                  Instale <a href="https://getalby.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">Alby</a> ou <a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noreferrer" className="text-emerald-400 underline">nos2x</a>
                </p>
              )}

              {/* Entrar com Chave */}
              <button
                onClick={() => { setError(''); setView('nsec') }}
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Entrar com Chave Privada
              </button>

              {/* Criar Chaves */}
              <a
                href="https://media.libernet.app/generate-keys"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Chaves Nostr
              </a>
            </div>
          ) : (
            /* Tela de nsec */
            <div>
              <button
                onClick={() => { setView('menu'); setError(''); setNsec('') }}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar
              </button>
              <form onSubmit={handleNsec} className="space-y-3">
                <div className="relative">
                  <input
                    type={showNsec ? 'text' : 'password'}
                    placeholder="nsec1..."
                    value={nsec}
                    onChange={e => setNsec(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 pr-10"
                    autoComplete="off"
                    autoFocus
                  />
                  <button type="button"
                    onClick={() => setShowNsec(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showNsec ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading || !nsec.trim()}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
                <p className="text-xs text-slate-500 text-center">A chave privada nunca é enviada ao servidor</p>
              </form>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Powered by <span className="text-emerald-400">Nostr Protocol</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
