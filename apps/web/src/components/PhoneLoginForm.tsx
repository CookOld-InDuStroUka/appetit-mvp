import { useState } from "react";
import { useAuth } from "./AuthContext";

function formatKazakhPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";

  let normalized = digits;
  if (normalized.startsWith("8")) normalized = "7" + normalized.slice(1);
  if (!normalized.startsWith("7")) normalized = "7" + normalized;
  normalized = normalized.slice(0, 11);

  const rest = normalized.slice(1);
  let formatted = "+7";
  if (rest.length > 0) formatted += " " + rest.slice(0, 3);
  if (rest.length > 3) formatted += " " + rest.slice(3, 6);
  if (rest.length > 6) formatted += " " + rest.slice(6, 8);
  if (rest.length > 8) formatted += " " + rest.slice(8, 10);

  return formatted.trim();
}

function normalizeKazakhPhone(input: string) {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (!digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);

  if (digits.length !== 11) return null;
  return "+" + digits;
}

function validateRegistrationFields(name: string, password: string) {
  const errors: string[] = [];
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    errors.push("Имя должно содержать минимум 2 символа");
  }
  if (trimmedName.length > 100) {
    errors.push("Имя не может быть длиннее 100 символов");
  }
  if (trimmedName && !/^[A-Za-zА-Яа-яЁё\-\s']+$/.test(trimmedName)) {
    errors.push("Имя может содержать только буквы, пробел и дефис");
  }

  if (password.length < 6) {
    errors.push("Пароль должен содержать минимум 6 символов");
  }
  if (password.length > 100) {
    errors.push("Пароль не может быть длиннее 100 символов");
  }
  if (!/[A-Za-zА-Яа-яЁё]/.test(password) || !/\d/.test(password)) {
    errors.push("Пароль должен содержать хотя бы одну букву и одну цифру");
  }

  return { errors, trimmedName };
}

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

    const normalizedPhone = normalizeKazakhPhone(phone);
    if (!normalizedPhone) {
      setError("Введите номер телефона в формате +7 XXX XXX XX XX");
      return;
    }

    const payload: Record<string, string> = { phone: normalizedPhone, password };
    if (mode === "register") {
      const { errors: validationErrors, trimmedName } = validateRegistrationFields(name, password);
      if (validationErrors.length > 0) {
        setError(validationErrors.join("\n"));
        return;
      }
      payload.name = trimmedName;
    }

    try {
      setLoading(true);
      const endpoint = mode === "register" ? "register" : "login";
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        const detailMessages = Array.isArray(err?.details)
          ? err.details
              .map((item: any) => {
                if (typeof item === "string") return item;
                if (item && typeof item.message === "string") return item.message;
                return null;
              })
              .filter((msg: any): msg is string => typeof msg === "string" && msg.trim().length > 0)
              .map((msg: string) => msg.trim())
          : [];
        const detailsText = detailMessages.join("\n");

        if (err?.error === "phone_taken") {
          setError(detailsText || err?.message || "Этот номер уже зарегистрирован");
        } else if (err?.error === "Invalid credentials") {
          setError("Неверный телефон или пароль");
        } else if (err?.error === "invalid_phone") {
          setError(err?.message || "Введите номер телефона в формате Казахстана (+7 XXX XXX XX XX)");
        } else if (detailsText) {
          setError(detailsText);
        } else if (typeof err?.message === "string" && err.message.trim()) {
          setError(err.message.trim());
        } else if (typeof err?.error === "string") {
          setError(err.error);
        } else {
          setError("Не удалось выполнить действие");
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
        onChange={(e) => setPhone(formatKazakhPhone(e.target.value))}
        required
        inputMode="tel"
        minLength={4}
        maxLength={19}
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
      {error && <div style={{ color: "red", whiteSpace: "pre-line" }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Подождите..." : mode === "register" ? "Зарегистрироваться" : "Войти"}
      </button>
    </form>
  );
}
