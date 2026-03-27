import { createContext, useContext, useState, type ReactNode } from "react";
import { getAuthToken, removeAuthToken, setAuthToken } from "./api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
  const [user, setUser] = useState<AuthContextType["user"]>(() =>
    getAuthToken() ? { name: "Admin User", email: "admin@unison.edu", role: "admin" } : null
  );

  const login = async (_email: string, _password: string) => {
    // In production, call /api/auth/login and get the token
    // For now, simulate login
    const mockToken = "mock-jwt-token-" + Date.now();
    setAuthToken(mockToken);
    setUser({ name: "Admin User", email: _email, role: "admin" });
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
