import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthModal() {
  const { close, requestCode, verifyCode } = useAuth();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("+7");
  const [code, setCode] = useState("");

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
        {step === "phone" ? (
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
        )}
      </div>
    </div>
  );
}
