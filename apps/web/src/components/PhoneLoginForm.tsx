import { useState } from "react";
import { useAuth } from "./AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function PhoneLoginForm() {
  const { setUser, close } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (mode === "register" && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    const payload: Record<string, string> = { phone, password };
    if (mode === "register") {
      payload.name = name;
    }

    try {
      setLoading(true);
      const endpoint = mode === "register" ? "register" : "login";
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        if (err?.error === "phone_taken") {
          setError("Этот номер уже зарегистрирован");
        } else if (err?.error === "Invalid credentials") {
          setError("Неверный телефон или пароль");
        } else {
          setError(err?.error || "Не удалось выполнить действие");
        }
        return;
      }

      const data = await response.json();
      if (data?.user) {
        setUser(data.user);
        close();
      }
    } catch {
      setError("Не удалось выполнить действие");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setError(null);
    if (next === "login") {
      setConfirmPassword("");
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => switchMode("login")}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: mode === "login" ? "#eee" : "transparent",
            cursor: "pointer",
          }}
        >
          Вход
        </button>
        <button
          type="button"
          onClick={() => switchMode("register")}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: mode === "register" ? "#eee" : "transparent",
            cursor: "pointer",
          }}
        >
          Регистрация
        </button>
      </div>

      {mode === "register" && (
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <input
        type="tel"
        placeholder="Телефон"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        minLength={10}
        maxLength={20}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      {mode === "register" && (
        <input
          type="password"
          placeholder="Повторите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Подождите..." : mode === "register" ? "Зарегистрироваться" : "Войти"}
      </button>
    </form>
  );
}
