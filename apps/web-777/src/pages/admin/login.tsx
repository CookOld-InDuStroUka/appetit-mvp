import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../../components/AdminAuthContext";

export default function AdminLoginPage() {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, admin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (admin) router.replace("/admin");
  }, [admin, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(loginName, password);
    if (ok) {
      router.push("/admin");
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h1>Админ вход</h1>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          value={loginName}
          onChange={e => setLoginName(e.target.value)}
          placeholder="Логин"
          style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Пароль"
          style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }}
        />
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button
          type="submit"
          style={{ padding: "10px", border: "none", borderRadius: 8, background: "var(--accent)", color: "#fff", cursor: "pointer" }}
        >
          Войти
        </button>
      </form>
    </div>
  );
}
