import React, { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function AdminModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const send = async (path: "login" | "register") => {
    await fetch(`${API_BASE}/admin/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    window.location.href = "/admin";
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={stop}>
        <div style={{ position: "relative", marginBottom: 16, textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Админ вход</h2>
          <button onClick={onClose} style={{ position: "absolute", right: 0, top: 0, background: "transparent", border: "none", cursor: "pointer" }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <input
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Пароль"
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <button onClick={() => send("login")} style={{ padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
            Войти
          </button>
          <button onClick={() => send("register")} style={{ padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", cursor: "pointer" }}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
}
