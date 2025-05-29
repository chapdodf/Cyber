"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  token: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
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
    console.log('AuthProvider - Iniciando verificação de token');
    const saved = localStorage.getItem("token");
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        console.log('AuthProvider - Dados encontrados no localStorage:', parsedUser);
        
        if (parsedUser && parsedUser.token) {
          console.log('AuthProvider - Token válido encontrado');
          setUser(parsedUser);
        } else {
          console.log('AuthProvider - Token inválido ou ausente');
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("AuthProvider - Erro ao carregar dados do localStorage:", error);
        localStorage.removeItem("token");
      }
    } else {
      console.log('AuthProvider - Nenhum token encontrado no localStorage');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    try {
      console.log('AuthProvider - Iniciando processo de login');
      console.log('AuthProvider - Dados recebidos:', userData);

      if (!userData.token) {
        console.error('AuthProvider - Token não fornecido nos dados');
        throw new Error("Token não fornecido");
      }

      console.log('AuthProvider - Salvando dados do usuário');
      setUser(userData);
      localStorage.setItem("token", JSON.stringify(userData));
      console.log('AuthProvider - Login concluído com sucesso');
    } catch (error) {
      console.error("AuthProvider - Erro durante o login:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      console.log('AuthProvider - Iniciando logout');
      setUser(null);
      localStorage.removeItem("token");
      console.log('AuthProvider - Logout concluído');
    } catch (error) {
      console.error("AuthProvider - Erro durante o logout:", error);
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
