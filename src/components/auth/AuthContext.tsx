import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "../../lib/api";

export interface User {
  id: string;
  name: string;
  npub: string;
  role: string;
  plan: string;
  tokens_used?: number;
  token_balance?: number;
}

interface AuthContextValue {
  currentUser: User | null;
  loginWithExtension: () => Promise<boolean>;
  loginWithNsec: (nsec: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão existente (manter logado)
    api.getCurrentUser().then(user => {
      setCurrentUser(user as User | null);
      setIsLoading(false);
    });
  }, []);

  const loginWithExtension = async (): Promise<boolean> => {
    setError(null);
    try {
      const user = await api.loginNostrExtension();
      if (user) {
        setCurrentUser(user as User);
        return true;
      }
      setError("Falha ao conectar com o relay. Tente novamente.");
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      if (msg.includes("não encontrada")) {
        setError("Extensão Nostr não detectada. Instale Alby ou nos2x.");
      } else {
        setError(msg);
      }
      return false;
    }
  };

  const loginWithNsec = async (nsec: string): Promise<boolean> => {
    setError(null);
    try {
      if (!nsec.startsWith("nsec1")) {
        setError("Chave inválida. Deve começar com nsec1...");
        return false;
      }
      const user = await api.loginNostrNsec(nsec);
      if (user) {
        setCurrentUser(user as User);
        return true;
      }
      setError("Chave inválida ou erro no servidor.");
      return false;
    } catch {
      setError("Erro ao validar chave. Tente novamente.");
      return false;
    }
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      currentUser,
      loginWithExtension,
      loginWithNsec,
      logout,
      isLoading,
      error,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
