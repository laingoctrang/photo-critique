import React, { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { User, UserRole } from "../types";
import { decodeAccessToken } from "../utils";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = decodeAccessToken(token);
    console.log("Decoded token on app load:", decoded);

    // token hết hạn → logout
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    setUser(decoded);
    setLoading(false);
  }, []);

  function login(token: string) {
    localStorage.setItem("token", token);
    const decoded = decodeAccessToken(token);

    if (decoded) {
      setUser(decoded);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  function hasRole(roles: UserRole[] | UserRole) {
    if (!user) return false;
    const required = Array.isArray(roles) ? roles : [roles];
    return required.some(r => user.roles.includes(r));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}