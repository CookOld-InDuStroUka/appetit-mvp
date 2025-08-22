import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthModal() {
  const { close, requestCode, verifyCode, registerEmail } = useAuth();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+7");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const start = async () => {
    await requestCode(phone);
    setStep("code");
  };

  const confirm = async () => {
    await verifyCode(phone, code);
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={stop}>
        <div style={{ position: "relative", marginBottom: 16, textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Авторизация</h2>
          <button onClick={close} style={{ position: "absolute", right: 0, top: 0, background: "transparent", border: "none", cursor: "pointer" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setMode("phone")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--border)", background: mode === "phone" ? "var(--accent)" : "var(--card-bg)", color: mode === "phone" ? "#fff" : "var(--text)", cursor: "pointer" }}>Телефон</button>
          <button onClick={() => setMode("email")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--border)", background: mode === "email" ? "var(--accent)" : "var(--card-bg)", color: mode === "email" ? "#fff" : "var(--text)", cursor: "pointer" }}>Email</button>
        </div>

        {mode === "phone" ? (
          step === "phone" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p>Введите ваш номер телефона, чтобы получить код подтверждения.</p>
              <input
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p>Введите код из SMS</p>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <button onClick={confirm} style={{ padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
                Подтвердить
              </button>
            </div>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              placeholder="Пароль"
            />
            <button onClick={() => registerEmail(email, password)} style={{ padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}>
              Зарегистрироваться
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
