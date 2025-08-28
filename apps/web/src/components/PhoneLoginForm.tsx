import { useState } from "react";
import { useAuth } from "./AuthContext";

export default function PhoneLoginForm() {
  const { setUser, close } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, phone, password }),
    });
    if (r.ok) {
      const data = await r.json();
      setUser(data.user);
      close();
    } else {
      setError("Не удалось войти");
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        type="text"
        placeholder="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Телефон"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button type="submit">Войти</button>
    </form>
  );
}
