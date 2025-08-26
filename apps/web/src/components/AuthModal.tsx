import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthModal() {
  const { close, requestCode, verifyCode } = useAuth();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"input" | "code">("input");
  const [phone, setPhone] = useState("+7");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const start = async () => {
    const contact = mode === "phone" ? phone : email;
    await requestCode(contact);
    setStep("code");
  };

  const confirm = async () => {
    const contact = mode === "phone" ? phone : email;
    await verifyCode(contact, code);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={stop}>
        <div style={{ position: "relative", marginBottom: 16, textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Авторизация</h2>
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

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => {
              setMode("phone");
              setStep("input");
            }}
            style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--border)", background: mode === "phone" ? "var(--accent)" : "var(--card-bg)", color: mode === "phone" ? "#fff" : "var(--text)", cursor: "pointer" }}
          >
            Телефон
          </button>
          <button
            onClick={() => {
              setMode("email");
              setStep("input");
            }}
            style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--border)", background: mode === "email" ? "var(--accent)" : "var(--card-bg)", color: mode === "email" ? "#fff" : "var(--text)", cursor: "pointer" }}
          >
            Email
          </button>
        </div>

        {mode === "phone"
          ? step === "input"
            ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p>Введите ваш номер телефона, чтобы получить код подтверждения.</p>
                  <input
                    name="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
                    placeholder="+7"
                  />
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: 14 }}>Я принимаю оферту и условия обработки персональных данных</span>
                  </label>
                  <button onClick={start} style={{ padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
                    Получить код по SMS
                  </button>
                </div>
              )
            : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p>Введите код из SMS</p>
                  <input
                    name="code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
                  />
                  <button onClick={confirm} style={{ padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
                    Подтвердить
                  </button>
                </div>
              )
          : step === "input"
            ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p>Введите ваш email, чтобы получить код подтверждения.</p>
                  <input
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
                    placeholder="Email"
                  />
                  <button onClick={start} style={{ padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
                    Получить код по email
                  </button>
                </div>
              )
            : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p>Введите код из письма</p>
                  <input
                    name="code"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
                  />
                  <button onClick={confirm} style={{ padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
                    Подтвердить
                  </button>
                </div>
              )}
      </div>
    </div>
  );
}
