import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface AuthContextType {
  deliveryId: string | null;
  login: (id: string) => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("gigshield_delivery_id");
    if (stored) {
      setDeliveryId(stored);
    }
    setIsInitialized(true);
  }, []);

  const login = (id: string) => {
    localStorage.setItem("gigshield_delivery_id", id);
    setDeliveryId(id);
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("gigshield_delivery_id");
    setDeliveryId(null);
    setLocation("/");
  };

  return (
    <AuthContext.Provider value={{ deliveryId, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
