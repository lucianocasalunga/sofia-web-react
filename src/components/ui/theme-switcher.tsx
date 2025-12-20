import React, { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

const THEME_KEY = "sofia-libernet-theme";

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (next: Theme) => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (next === "system") {
      root.classList.toggle("dark", prefersDark);
      root.classList.toggle("light", !prefersDark);
    } else {
      root.classList.toggle("dark", next === "dark");
      root.classList.toggle("light", next === "light");
    }
  };

  const handleChange = (next: Theme) => {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  return (
    <div className="inline-flex items-center gap-1 bg-slate-900/70 border border-slate-700/80 rounded-full px-1 py-0.5">
      <button
        onClick={() => handleChange("light")}
        className={`p-1.5 rounded-full transition-colors ${
          theme === "light" ? "bg-slate-100 text-slate-900" : "text-slate-300 hover:text-slate-100"
        }`}
        title="Tema claro"
      >
        <Sun className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleChange("system")}
        className={`p-1.5 rounded-full transition-colors ${
          theme === "system" ? "bg-slate-800 text-slate-50" : "text-slate-300 hover:text-slate-100"
        }`}
        title="Seguir sistema"
      >
        <Monitor className="w-3 h-3" />
      </button>
      <button
        onClick={() => handleChange("dark")}
        className={`p-1.5 rounded-full transition-colors ${
          theme === "dark" ? "bg-slate-900 text-emerald-400" : "text-slate-300 hover:text-slate-100"
        }`}
        title="Tema escuro"
      >
        <Moon className="w-3 h-3" />
      </button>
    </div>
  );
};
