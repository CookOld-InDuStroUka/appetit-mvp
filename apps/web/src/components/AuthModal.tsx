import React from "react";
import { useAuth } from "./AuthContext";
import TelegramLoginButton from "./TelegramLoginButton";

export default function AuthModal() {
  const { close } = useAuth();
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
        <TelegramLoginButton />
      </div>
    </div>
  );
}
