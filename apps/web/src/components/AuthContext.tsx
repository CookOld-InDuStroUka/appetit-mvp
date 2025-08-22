import React, { createContext, useContext, useState } from "react";
import AuthModal from "./AuthModal";

export type User = { id: string; phone: string; bonus: number };

type AuthCtx = {
  user: User | null;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  requestCode: (phone: string) => Promise<void>;
  verifyCode: (phone: string, code: string) => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setOpen] = useState(false);

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const requestCode = async (phone: string) => {
    await fetch("/api/v1/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
  };

  const verifyCode = async (phone: string, code: string) => {
    const res = await fetch("/api/v1/auth/verify-code", {
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

  return (
    <Ctx.Provider value={{ user, isOpen, open, close, requestCode, verifyCode }}>
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
