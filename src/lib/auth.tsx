import { createContext, useContext, useState, type ReactNode } from "react";
import { apiClient, getAuthToken, removeAuthToken, setAuthToken } from "./api";
import { TenantInfo } from "@/types/admin.types";

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  role: string;
  tenant_id?: string;
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
  tenant: TenantInfo | null;
  setTenant: (tenant: TenantInfo | null) => void;
  login: (email: string, password: string) => Promise<string>;
  logout: () => void;
  updateUser: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  tenant: null,
  setTenant: () => {},
  login: async () => "",
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

const STORED_USER_KEY = "unison_user";
const STORED_TENANT_KEY = "unison_tenant";

function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredTenant(): TenantInfo | null {
  try {
    const raw = localStorage.getItem(STORED_TENANT_KEY);
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
  const [tenant, setTenant] = useState<TenantInfo | null>(() =>
    getAuthToken() ? getStoredTenant() : null
  );

  const login = async (email: string, password: string): Promise<string> => {
    const res = await apiClient.post<{
      token: string;
      role: string;
      account_status: string;
      tenant?: TenantInfo | null;
      profile?: UserProfile;
    }>("/api/auth/login", { email, password });

    if (res.account_status !== "approved") {
      throw new Error("Account not approved yet.");
    }

    const role = res.role;
    const profile: UserProfile = res.profile || {
      id: "super_admin",
      username: email.split("@")[0],
      display_name: role === "super_admin" ? "Platform Super Admin" : "Administrator",
      email,
      role,
    };

    setAuthToken(res.token);
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(profile));
    if (res.tenant) {
      localStorage.setItem(STORED_TENANT_KEY, JSON.stringify(res.tenant));
      setTenant(res.tenant);
    } else {
      localStorage.removeItem(STORED_TENANT_KEY);
      setTenant(null);
    }

    setUser(profile);
    setIsAuthenticated(true);
    return role;
  };

  const logout = () => {
    removeAuthToken();
    localStorage.removeItem(STORED_USER_KEY);
    localStorage.removeItem(STORED_TENANT_KEY);
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
  };

  const updateUser = (profile: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...profile };
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const updateTenant = (newTenant: TenantInfo | null) => {
    if (newTenant) {
      localStorage.setItem(STORED_TENANT_KEY, JSON.stringify(newTenant));
    } else {
      localStorage.removeItem(STORED_TENANT_KEY);
    }
    setTenant(newTenant);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        tenant,
        setTenant: updateTenant,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
