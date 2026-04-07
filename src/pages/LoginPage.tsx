import { useState, useEffect } from "react";
import { MatrixRain } from "../components/ui/matrix-rain";
import { SofiaLogo } from "../components/ui/sofia-logo";
import { useAuth } from "../components/auth/AuthContext";

export default function LoginPage() {
  const { loginWithExtension, loginWithNsec, error, clearError } = useAuth();
  const [hasExtension, setHasExtension] = useState(false);
  const [showNsecInput, setShowNsecInput] = useState(false);
  const [nsecValue, setNsecValue] = useState("");
  const [showNsec, setShowNsec] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);

  useEffect(() => {
    const checkExtension = () => setHasExtension(!!window.nostr);
    checkExtension();
    const timer = setTimeout(checkExtension, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleExtensionLogin = async () => {
    setIsLoading(true);
    setLoadingMethod("extension");
    clearError();
    try {
      await loginWithExtension();
    } finally {
      setIsLoading(false);
      setLoadingMethod(null);
    }
  };

  const handleNsecLogin = async () => {
    if (!nsecValue.trim()) return;
    setIsLoading(true);
    setLoadingMethod("nsec");
    clearError();
    try {
      const success = await loginWithNsec(nsecValue.trim());
      if (success) {
        setNsecValue("");
      }
    } finally {
      setIsLoading(false);
      setLoadingMethod(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNsecLogin();
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <MatrixRain />

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-[#111]/80 rounded-3xl p-8 border border-emerald-500/30 shadow-[0_0_60px_-15px_rgba(16,185,129,0.3)]">

          {/* Logo + Titulo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full border-2 border-emerald-500 flex items-center justify-center mb-4 bg-black/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
              <SofiaLogo className="w-12 h-12 text-emerald-400" />
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Sofia LiberNet</h1>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <p className="text-gray-400 text-sm mt-2 text-center">
              Inteligência descentralizada. Liberdade conectada.
            </p>
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Botoes de login */}
          <div className="space-y-4">

            {/* Extensao Nostr */}
            <button
              onClick={handleExtensionLogin}
              disabled={isLoading || !hasExtension}
              className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 group ${
                hasExtension
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]"
                  : "bg-emerald-500/20 text-emerald-300/50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                {loadingMethod === "extension" ? (
                  <Spinner />
                ) : (
                  <KeyIcon className={`w-5 h-5 ${hasExtension ? "group-hover:rotate-12" : ""} transition-transform`} />
                )}
                <span>{loadingMethod === "extension" ? "Conectando..." : "Entrar com Extensão Nostr"}</span>
              </div>
              <p className={`text-xs mt-1 ${hasExtension ? "text-emerald-100/80" : "text-gray-500"}`}>
                {hasExtension ? "Alby, nos2x, Nostr Connect" : "Nenhuma extensão detectada"}
              </p>
            </button>

            {/* Chave Privada (nsec) */}
            {!showNsecInput ? (
              <button
                onClick={() => { setShowNsecInput(true); clearError(); }}
                disabled={isLoading}
                className="w-full bg-[#111] hover:bg-[#1a1a1a] text-white font-semibold py-4 px-6 rounded-2xl border border-gray-800 hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <ShieldIcon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Entrar com Chave Privada</span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Cole sua nsec para entrar
                </p>
              </button>
            ) : (
              <div className="bg-[#111] rounded-2xl border border-emerald-500/30 p-4 space-y-3">
                <div className="relative">
                  <input
                    type={showNsec ? "text" : "password"}
                    value={nsecValue}
                    onChange={(e) => setNsecValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="nsec1..."
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                    className="w-full p-3 pr-12 bg-black/50 border border-gray-700 focus:border-emerald-500/50 rounded-xl text-white text-sm font-mono placeholder-gray-600 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNsec(!showNsec)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                    aria-label={showNsec ? "Esconder chave" : "Mostrar chave"}
                  >
                    {showNsec ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleNsecLogin}
                    disabled={isLoading || !nsecValue.trim()}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:text-emerald-300/50 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                  >
                    {loadingMethod === "nsec" ? "Validando..." : "Entrar"}
                  </button>
                  <button
                    onClick={() => { setShowNsecInput(false); setNsecValue(""); clearError(); }}
                    className="px-4 py-2.5 text-gray-400 hover:text-white rounded-xl border border-gray-800 hover:border-gray-600 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-gray-600 text-xs text-center">
                  Sua chave nunca sai do seu navegador
                </p>
              </div>
            )}

            {/* Criar Chaves - redireciona pro LiberMedia */}
            <a
              href="https://media.libernet.app/generate-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center font-semibold py-4 px-6 rounded-2xl border border-transparent bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 group relative overflow-hidden"
            >
              <div
                className="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50"
                style={{
                  padding: "1px",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude" as const,
                }}
              ></div>
              <div className="flex items-center justify-center gap-3 text-white relative">
                <SparklesIcon className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
                <span>Criar Chaves Nostr</span>
              </div>
              <p className="text-gray-400 text-xs mt-1 relative">
                Primeira vez? Crie suas chaves no LiberMedia
              </p>
            </a>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-xs mb-2">
              Powered by Nostr Protocol
            </p>
            <a
              href="https://nostr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400/60 hover:text-emerald-300 text-sm transition-colors hover:underline"
            >
              O que é Nostr?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Icones inline (sem dependencia externa)
// ============================================================================

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" /><path d="M22 5h-4" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}
