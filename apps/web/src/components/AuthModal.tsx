import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import TelegramLoginButton from "./TelegramLoginButton";
import PhoneLoginForm from "./PhoneLoginForm";

export default function AuthModal() {
  const { close } = useAuth();
  const [tab, setTab] = useState<"telegram" | "phone">("telegram");
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" style={{ maxWidth: 360, textAlign: "center" }} onClick={stop}>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Вход</h2>
          <button
            onClick={close}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 24,
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          <button
            onClick={() => setTab("telegram")}
            style={{
              padding: "4px 8px",
              border: "1px solid #ccc",
              background: tab === "telegram" ? "#eee" : "transparent",
              cursor: "pointer",
            }}
          >
            Telegram
          </button>
          <button
            onClick={() => setTab("phone")}
            style={{
              padding: "4px 8px",
              border: "1px solid #ccc",
              background: tab === "phone" ? "#eee" : "transparent",
              cursor: "pointer",
            }}
          >
            Телефон
          </button>
        </div>
        {tab === "telegram" ? <TelegramLoginButton /> : <PhoneLoginForm />}
      </div>
    </div>
  );
}
