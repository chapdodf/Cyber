"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  username: string;
  token: string;
  isAdmin: boolean;
  email: string;
  id: number;
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("cyber_user");
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        // Validar se o token existe e não está expirado
        if (parsedUser && parsedUser.token) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("cyber_user");
        }
      } catch (error) {
        console.error("Erro ao carregar usuário do localStorage:", error);
        localStorage.removeItem("cyber_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    try {
      if (!userData.token) {
        throw new Error("Token não fornecido");
      }
      setUser(userData);
      localStorage.setItem("cyber_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem("cyber_user");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user?.token,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 
