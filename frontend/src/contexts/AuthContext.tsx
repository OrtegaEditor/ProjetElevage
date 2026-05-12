    import { createContext, useContext, useState, ReactNode } from "react";
    import { User, UserRole } from "../types";
    import { mockUsers } from "../data/mockData";

    interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
    }

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = (email: string, password: string): boolean => {
        const foundUser = mockUsers.find((u) => u.email === email && u.password === password);
        if (foundUser) {
        setUser(foundUser);
        return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
        value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
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
