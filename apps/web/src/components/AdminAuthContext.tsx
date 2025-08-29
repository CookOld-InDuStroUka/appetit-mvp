import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

export type Admin = { id: string; role: string };

type AdminCtx = {
  admin: Admin | null;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const Ctx = createContext<AdminCtx | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("admin");
      if (raw) setAdmin(JSON.parse(raw));
    }
  }, []);

  const login = async (
    login: string,
    password: string
  ): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    if (res.ok) {
      const { id, role } = await res.json();
      const data = { id, role };
      setAdmin(data);
      if (typeof window !== "undefined")
        localStorage.setItem("admin", JSON.stringify(data));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    if (typeof window !== "undefined") localStorage.removeItem("admin");
  };

  return <Ctx.Provider value={{ admin, login, logout }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
