import React, { createContext, useContext, useEffect, useState } from "react";
import AuthModal from "./AuthModal";

export type User = { id: string; phone?: string | null; email?: string | null; name?: string | null; birthDate?: string | null; notificationsEnabled?: boolean; bonus: number };

type AuthCtx = {
  user: User | null;
  setUser: (u: User | null) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
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

  const logout = () => setUser(null);

  return (
    <Ctx.Provider value={{ user, setUser, isOpen, open, close, logout }}>
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
