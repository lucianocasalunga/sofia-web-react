import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "../../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
}

interface AuthContextValue {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário já está autenticado
    api.getCurrentUser().then(user => {
      setCurrentUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = await api.login(email, password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
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
