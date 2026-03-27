import { createContext, useContext, useState, type ReactNode } from "react";
import { apiClient, getAuthToken, removeAuthToken, setAuthToken } from "./api";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: string;
  degree?: string;
  roll_number?: string;
  batch?: string;
  graduation_year?: number;
  phone?: string;
  profile_picture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

const STORED_USER_KEY = "unison_user";

function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
  const [user, setUser] = useState<UserProfile | null>(() =>
    getAuthToken() ? getStoredUser() : null
  );

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{
      token: string;
      role: string;
      account_status: string;
      profile: UserProfile;
    }>("/api/auth/login", { email, password });

    if (res.account_status !== "approved") {
      throw new Error("Account not approved yet.");
    }

    setAuthToken(res.token);
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(res.profile));
    setUser(res.profile);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem(STORED_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (profile: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profile };
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
