import React, { createContext, useContext, useEffect, useState } from "react";
import AuthModal from "./AuthModal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export type User = { id: string; phone?: string | null; email?: string | null; name?: string | null; birthDate?: string | null; notificationsEnabled?: boolean; bonus: number };

type AuthCtx = {
  user: User | null;
  setUser: (u: User | null) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  requestCode: (contact: string) => Promise<void>;
  verifyCode: (contact: string, code: string) => Promise<void>;
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

  const requestCode = async (contact: string) => {
    const payload = contact.includes("@") ? { email: contact } : { phone: contact };
    await fetch(`${API_BASE}/auth/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  };

  const verifyCode = async (contact: string, code: string) => {
    const payload = contact.includes("@") ? { email: contact, code } : { phone: contact, code };
    const res = await fetch(`${API_BASE}/auth/verify-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      close();
    }
  };

  const logout = () => setUser(null);

  return (
    <Ctx.Provider value={{ user, setUser, isOpen, open, close, requestCode, verifyCode, logout }}>
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
