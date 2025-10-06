import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useAdminAuth } from "../../components/AdminAuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Admin = { id: string; login: string; role: string };

export default function AdminsPage() {
  const { admin } = useAdminAuth();
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [filter, setFilter] = useState("");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manager");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (!admin) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/admin/accounts`, {
          headers: { "X-Admin-Id": admin.id },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok || !data || !Array.isArray(data.admins)) {
          throw new Error(data?.message || data?.error || "Не удалось загрузить администраторов");
        }
        setAdmins(data.admins);
      } catch (err) {
        setAdmins([]);
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить администраторов"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [admin]);

  const reload = async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/accounts`, {
        headers: { "X-Admin-Id": admin.id },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !Array.isArray(data.admins)) {
        throw new Error(data?.message || data?.error || "Не удалось обновить список");
      }
      setAdmins(data.admins);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить список");
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!loginName.trim() || !password.trim()) {
      setStatus({ type: "error", text: "Укажите логин и пароль" });
      return;
    }
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/admin/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Id": admin!.id },
        body: JSON.stringify({ login: loginName.trim(), password, role }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Не удалось создать администратора");
      }
      setLoginName("");
      setPassword("");
      setRole("manager");
      await reload();
      setStatus({ type: "success", text: "Администратор создан" });
    } catch (err) {
      setStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Не удалось создать администратора",
      });
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/admin/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Admin-Id": admin!.id },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || data?.error || "Не удалось обновить роль");
      }
      setAdmins((prev) =>
        (prev ?? []).map((a) => (a.id === id ? { ...a, role: newRole } : a))
      );
      setStatus({ type: "success", text: "Роль обновлена" });
    } catch (err) {
      setStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Не удалось обновить роль",
      });
    }
  };

  const remove = async (id: string) => {
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/admin/accounts/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Id": admin!.id },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || data?.error || "Не удалось удалить администратора");
      }
      setAdmins((prev) => (prev ?? []).filter((a) => a.id !== id));
      setStatus({ type: "success", text: "Администратор удалён" });
    } catch (err) {
      setStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Не удалось удалить администратора",
      });
    }
  };

  const filtered = useMemo(
    () => (admins ?? []).filter((a) => a.login.toLowerCase().includes(filter.toLowerCase())),
    [admins, filter]
  );

  if (admin?.role !== "super") return <AdminLayout>Нет доступа</AdminLayout>;

  return (
    <AdminLayout>
      <h1>Администраторы</h1>
      <div style={{ marginBottom: 24 }}>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Фильтр" style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
      </div>
      {loading && <p>Загрузка...</p>}
      {error && (
        <p style={{ color: "#d33", marginTop: 0, marginBottom: 16 }}>{error}</p>
      )}
      {status && (
        <p
          style={{
            color: status.type === "success" ? "#0a8a0a" : "#d33",
            marginTop: 0,
            marginBottom: 16,
          }}
        >
          {status.text}
        </p>
      )}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Логин</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Роль</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((a) => (
            <tr key={a.id}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{a.login}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                <select value={a.role} onChange={(e) => changeRole(a.id, e.target.value)}>
                  <option value="manager">manager</option>
                  <option value="super">super</option>
                </select>
              </td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>
                <button onClick={() => remove(a.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: 32 }}>Создать администратора</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="Логин" style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="manager">manager</option>
          <option value="super">super</option>
        </select>
        <button onClick={create}>Создать</button>
      </div>
    </AdminLayout>
  );
}
