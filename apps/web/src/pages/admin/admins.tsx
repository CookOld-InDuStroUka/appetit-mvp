import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useAdminAuth } from "../../components/AdminAuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

type Admin = { id: string; login: string; role: string };

export default function AdminsPage() {
  const { admin } = useAdminAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filter, setFilter] = useState("");
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manager");

  useEffect(() => {
    if (!admin) return;
    fetch(`${API_BASE}/admin/accounts`, {
      headers: { "X-Admin-Id": admin.id },
    })
      .then((r) => r.json())
      .then((d) => setAdmins(d.admins));
  }, [admin]);

  const create = async () => {
    await fetch(`${API_BASE}/admin/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Id": admin!.id },
      body: JSON.stringify({ login: loginName, password, role }),
    });
    setLoginName("");
    setPassword("");
    setRole("manager");
    const res = await fetch(`${API_BASE}/admin/accounts`, { headers: { "X-Admin-Id": admin!.id } });
    setAdmins((await res.json()).admins);
  };

  const changeRole = async (id: string, newRole: string) => {
    await fetch(`${API_BASE}/admin/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Admin-Id": admin!.id },
      body: JSON.stringify({ role: newRole }),
    });
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, role: newRole } : a)));
  };

  const remove = async (id: string) => {
    await fetch(`${API_BASE}/admin/accounts/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Id": admin!.id },
    });
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = admins.filter((a) => a.login.includes(filter));

  if (admin?.role !== "super") return <AdminLayout>Нет доступа</AdminLayout>;

  return (
    <AdminLayout>
      <h1>Администраторы</h1>
      <div style={{ marginBottom: 24 }}>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Фильтр" style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }} />
      </div>
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
