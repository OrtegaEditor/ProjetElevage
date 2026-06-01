  // src/contexts/AuthContext.tsx
  import { createContext, useContext, useState, ReactNode, useEffect } from "react";
  import { User } from "../types";
  import { authAPI } from "../services/api";
  import { useNavigate } from "react-router-dom";

  interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (data: { name: string; email: string; password: string; telephone: string }) => Promise<boolean>;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    clearError: () => void;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isauthenticated, setisauthenticated] = useState<boolean>(false);
    const navigate = useNavigate();
    
    // Vérifier si l'utilisateur est déjà connecté au montage
    useEffect(() => {
      const initAuth = async () => {
        const token = localStorage.getItem("access_token");
        if (token) {
          try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
            setisauthenticated(true);
          } catch (err) {
            console.error("Erreur lors de la vérification de l'authentification:", err);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
          }
        }
        setIsLoading(false);
      };

      initAuth();
    }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);

      setUser(response.user);
      setisauthenticated(true);

      navigate("/dashboard");

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Email ou password incorrect";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

    const register = async (data: {
      name: string;
      email: string;
      password: string;
      telephone: string;
    }): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        await authAPI.register(data);
        // Inscription réussie, l'utilisateur doit se connecter manuellement
        return true;
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || "Erreur lors de l'inscription";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Erreur lors du logout:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      setisauthenticated(false);
      setIsLoading(false);
      navigate("/login");
    }
  };

    const clearError = () => {
      setError(null);
    };

    return (
      <AuthContext.Provider
        value={{
          user,
          login,
          logout,
          register,
          isAuthenticated: isauthenticated,
          isLoading,
          error,
          clearError,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
  }