import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import CreditsPage from "./pages/CreditsPage";
import SettingsPage from "./pages/SettingsPage";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import { SofiaLogo } from "./components/ui/sofia-logo";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoading } = useAuth();
  if (isLoading) return <SplashScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SplashScreen() {
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <SofiaLogo className="w-12 h-12 animate-pulse" />
        <p className="text-gray-500 text-sm">Inicializando Sofia LiberNet...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { currentUser, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSplash) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/creditos" element={<ProtectedRoute><CreditsPage /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
