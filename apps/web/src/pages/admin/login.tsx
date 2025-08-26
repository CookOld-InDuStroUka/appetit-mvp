import { useState } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../../components/AdminAuthContext";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAdminAuth();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    router.push("/admin");
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h1>Админ вход</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }} />
        <button type="submit" style={{ padding: "10px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer" }}>Войти</button>
      </form>
    </div>
  );
}
