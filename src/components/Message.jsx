import { useEffect, useRef } from 'react'
import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true })

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0,1,2].map(i => (
        <span key={i} className="thinking-dot w-2 h-2 rounded-full bg-emerald-400 inline-block"
          style={{ animationDelay: `${i * 0.2}s` }} />
      ))}
    </div>
  )
}

export default function Message({ msg }) {
  const ref = useRef()

  useEffect(() => {
    if (ref.current && window.hljs) {
      ref.current.querySelectorAll('pre code').forEach(b => {
        try { window.hljs.highlightElement(b) } catch {}
      })
    }
  })

  if (msg.role === 'thinking') {
    return (
      <div className="flex gap-3 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
          <img src="/static/logo-sofia.png" className="w-5 h-5 rounded-full object-contain" alt="Sofia" />
        </div>
        <div className="bg-slate-800/50 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/30">
          <ThinkingDots />
        </div>
      </div>
    )
  }

  if (msg.role === 'user') {
    return (
      <div className="flex gap-3 px-4 py-2 justify-end">
        <div className="max-w-[75%] bg-emerald-600 rounded-2xl rounded-tr-none px-4 py-2.5 text-white text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    )
  }

  if (msg.role === 'error') {
    return (
      <div className="flex gap-3 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 text-red-400 text-xs font-bold">!</div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-tl-none px-4 py-3 text-red-300 text-sm"
          dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
      </div>
    )
  }

  // assistant
  return (
    <div className="flex gap-3 px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img src="/static/logo-sofia.png" className="w-7 h-7 object-contain" alt="Sofia" />
      </div>
      <div className="max-w-[80%] bg-slate-800/50 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/30 text-sm">
        <div ref={ref} className="prose prose-invert"
          dangerouslySetInnerHTML={{ __html: marked.parse(msg.content || '') }} />
        {msg.timestamp && (
          <p className="text-xs text-slate-500 mt-2">
            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
