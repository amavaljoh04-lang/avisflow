import { useState, useEffect, useCallback } from "react";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("avisflow_token");
    const savedUser = localStorage.getItem("avisflow_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((tokenValue: string, userData: User) => {
    localStorage.setItem("avisflow_token", tokenValue);
    localStorage.setItem("avisflow_user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("avisflow_token");
    localStorage.removeItem("avisflow_user");
    setToken(null);
    setUser(null);
  }, []);

  return { user, token, loading, login, logout, isAdmin: user?.role === "admin" };
}
