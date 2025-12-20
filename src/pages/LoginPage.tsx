import React, { useState } from "react";
import { SofiaLogo } from "../components/ui/sofia-logo";
import { useAuth } from "../components/auth/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("E-mail ou senha incorretos");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen sofia-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-950/90 border border-slate-800/80 rounded-3xl shadow-xl shadow-emerald-500/10 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <SofiaLogo className="w-9 h-9" />
          <div>
            <h1 className="text-lg font-semibold text-slate-50">
              Sofia LiberNet
            </h1>
            <p className="text-xs text-slate-400">
              Inteligência descentralizada. Liberdade conectada.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">E-mail</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/80 focus:border-emerald-500/60"
              placeholder="voce@libernet.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300">Senha</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/80 focus:border-emerald-500/60"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                Conectando...
              </>
            ) : (
              <>Entrar</>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Sofia é uma IA autônoma e descentralizada da{" "}
          <span className="text-emerald-400">LiberNet</span>. Interface segura com memória compartilhada em /opt/memoria_sofia.md
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
