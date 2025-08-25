import React, { createContext, useContext, useEffect, useState } from "react";
import AuthModal from "./AuthModal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export type User = { id: string; phone?: string; email?: string; bonus: number };

type AuthCtx = {
  user: User | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  requestCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
  registerEmail: (email: string, password: string) => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("user");
      if (raw) setUserState(JSON.parse(raw));
    }
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem("user", JSON.stringify(u));
      else localStorage.removeItem("user");
    }
  };

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const requestCode = async (phone: string) => {
    await fetch(`${API_BASE}/auth/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
  };

  const verifyCode = async (phone: string, code: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      close();
    }
  };

  const registerEmail = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      close();
    }
  };

  const loginEmail = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      close();
    }
  };

  const logout = () => setUser(null);

  return (
    <Ctx.Provider value={{ user, isOpen, open, close, requestCode, verifyCode, registerEmail, loginEmail, logout }}>
      {children}
      {isOpen && <AuthModal />}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
