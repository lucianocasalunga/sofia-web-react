import React, { useEffect, useState } from "react";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import { SofiaLogo } from "./components/ui/sofia-logo";

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SofiaLogo className="w-12 h-12 animate-pulse" />
          <p className="text-slate-400 text-sm">
            Inicializando Sofia LiberNet...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return <ChatPage />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
