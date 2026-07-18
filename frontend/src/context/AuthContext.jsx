import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("civicfix_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("civicfix_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        setUser(data.user);
        localStorage.setItem("civicfix_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("civicfix_token");
        localStorage.removeItem("civicfix_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, user) {
    localStorage.setItem("civicfix_token", token);
    localStorage.setItem("civicfix_user", JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("civicfix_token");
    localStorage.removeItem("civicfix_user");
    setUser(null);
  }

  function updateUser(patch) {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("civicfix_user", JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
