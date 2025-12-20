import React from "react";
import { Settings, Info, Shield, Zap } from "lucide-react";
import { ThemeSwitcher } from "../ui/theme-switcher";

export const RightSidebar: React.FC = () => {
  return (
    <aside className="h-full w-64 border-l border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-col">
      <div className="px-4 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-300" />
          <span className="text-xs font-medium text-slate-100 uppercase tracking-wide">
            Painel da sessão
          </span>
        </div>
        <ThemeSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto chat-scroll px-3 py-3 space-y-4">
        <section className="px-2 py-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-100">
            <Info className="w-3 h-3 text-emerald-400" />
            <span>Sessão atual</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Sofia está operando em modo <span className="text-emerald-400">GPT-4o</span>{" "}
            com foco em infraestrutura, redes, Nostr e automação LiberNet.
          </p>
        </section>

        <section className="px-2 py-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-100">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Memória compartilhada</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Conversas armazenadas em{" "}
            <span className="text-emerald-400">/opt/memoria_sofia.md</span> com contexto
            compartilhado entre interfaces.
          </p>
        </section>

        <section className="px-2 py-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-100">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Integrações LiberNet</span>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-1.5">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              LiberMedia • Uploads Nostr + Lightning
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              Relay.libernet.app • Nostr Relay
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              LNBits • Pagamentos Lightning
            </li>
          </ul>
        </section>
      </div>
    </aside>
  );
};
