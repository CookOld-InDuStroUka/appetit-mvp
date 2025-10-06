import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useAdminAuth } from "../../components/AdminAuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type UserSummary = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  bonus: number;
  createdAt: string;
  lastOrderAt: string | null;
  ordersCount: number;
  birthDate: string | null;
  notificationsEnabled: boolean;
};

type RecentOrder = {
  id: string;
  status: string;
  type: string;
  total: number;
  createdAt: string;
};

type UserDetail = {
  user: UserSummary;
  recentOrders: RecentOrder[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("ru-RU");
  } catch {
    return value;
  }
}

function formatDateOnly(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("ru-RU");
  } catch {
    return value;
  }
}

export default function AdminUsersPage() {
  const { admin } = useAdminAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, UserDetail>>({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    bonus: "",
    notificationsEnabled: true,
    password: "",
  });

  const loadUsers = async (searchValue = query) => {
    if (!admin) return;
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/admin/users`);
      if (searchValue.trim()) url.searchParams.set("q", searchValue.trim());
      const res = await fetch(url.toString(), {
        headers: { "X-Admin-Id": admin.id },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !Array.isArray(data.users)) {
        throw new Error(
          data?.message || data?.error || "Не удалось загрузить пользователей"
        );
      }
      setUsers(data.users);
      if (data.users.length === 0) {
        setSelectedId(null);
      } else {
        setSelectedId((prev) =>
          prev && data.users.some((u: UserSummary) => u.id === prev)
            ? prev
            : data.users[0].id
        );
      }
    } catch (err) {
      setUsers([]);
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить пользователей"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const fetchDetails = async (id: string) => {
    if (!admin) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        headers: { "X-Admin-Id": admin.id },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.user) {
        throw new Error(
          data?.message || data?.error || "Не удалось загрузить данные пользователя"
        );
      }
      setDetails((prev) => ({ ...prev, [id]: data }));
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Не удалось загрузить данные пользователя"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    const cached = details[selectedId];
    if (cached) {
      const { user } = cached;
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        birthDate: user.birthDate ?? "",
        bonus: String(user.bonus ?? 0),
        notificationsEnabled: user.notificationsEnabled,
        password: "",
      });
      setSaveStatus(null);
    } else {
      fetchDetails(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, details]);

  const handleSave = async () => {
    if (!admin || !selectedId) return;
    const current = details[selectedId]?.user;
    const payload: Record<string, unknown> = {
      notificationsEnabled: form.notificationsEnabled,
    };

    const trimmedName = form.name.trim();
    if (trimmedName) {
      payload.name = trimmedName;
    }

    const trimmedPhone = form.phone.trim();
    if (trimmedPhone) {
      payload.phone = trimmedPhone;
    } else if (current?.phone) {
      payload.phone = "";
    }

    const trimmedEmail = form.email.trim();
    if (trimmedEmail) {
      payload.email = trimmedEmail;
    } else if (current?.email) {
      payload.email = "";
    }

    if (form.birthDate) {
      payload.birthDate = form.birthDate;
    } else if (current?.birthDate) {
      payload.birthDate = "";
    }

    if (form.bonus.trim() !== "") {
      const numeric = Number(form.bonus);
      if (!Number.isFinite(numeric) || !Number.isInteger(numeric) || numeric < 0) {
        setSaveStatus({
          type: "error",
          text: "Бонусы должны быть неотрицательным целым числом",
        });
        return;
      }
      payload.bonus = numeric;
    }

    const trimmedPassword = form.password.trim();
    if (trimmedPassword) {
      payload.password = trimmedPassword;
    }

    if (Object.keys(payload).length === 1) {
      setSaveStatus({ type: "error", text: "Нет изменений для сохранения" });
      return;
    }

    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${selectedId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Id": admin.id,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.user) {
        throw new Error(
          data?.message || data?.error || "Не удалось сохранить изменения"
        );
      }
      setDetails((prev) => {
        const currentDetail = prev[selectedId];
        return {
          ...prev,
          [selectedId]: {
            user: data.user,
            recentOrders: currentDetail?.recentOrders ?? [],
          },
        };
      });
      setUsers((prev) =>
        prev.map((item) => (item.id === selectedId ? { ...item, ...data.user } : item))
      );
      setForm((prev) => ({
        ...prev,
        name: data.user.name ?? "",
        phone: data.user.phone ?? "",
        email: data.user.email ?? "",
        birthDate: data.user.birthDate ?? "",
        bonus: String(data.user.bonus ?? 0),
        notificationsEnabled: data.user.notificationsEnabled,
        password: "",
      }));
      setSaveStatus({ type: "success", text: "Изменения сохранены" });
    } catch (err) {
      setSaveStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Не удалось сохранить изменения",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedDetail = selectedId ? details[selectedId] : null;

  return (
    <AdminLayout>
      <h1>Пользователи</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") loadUsers(query);
          }}
          placeholder="Поиск по имени, телефону или e-mail"
          style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6, flex: "1 1 240px" }}
        />
        <button onClick={() => loadUsers(query)} style={{ padding: "8px 16px" }}>
          Найти
        </button>
        <button
          onClick={() => {
            setQuery("");
            loadUsers("");
          }}
          style={{ padding: "8px 16px" }}
        >
          Сбросить
        </button>
      </div>
      {loading && <p>Загрузка списка...</p>}
      {error && <p style={{ color: "#d33" }}>{error}</p>}
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "minmax(320px, 1fr) minmax(360px, 1fr)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Имя</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Телефон</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>E-mail</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Бонусы</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Создан</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>Заказов</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedId(user.id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedId === user.id ? "#eef5ff" : "transparent",
                  }}
                >
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.name || "—"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.phone || "—"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.email || "—"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.bonus}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{formatDate(user.createdAt)}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{user.ordersCount}</td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 16, textAlign: "center" }}>
                    Пользователи не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          {selectedId ? (
            <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
              <h2 style={{ marginTop: 0 }}>Карточка пользователя</h2>
              {detailLoading && <p>Загрузка данных...</p>}
              {detailError && <p style={{ color: "#d33" }}>{detailError}</p>}
              {saveStatus && (
                <p style={{ color: saveStatus.type === "success" ? "#0a8a0a" : "#d33" }}>
                  {saveStatus.text}
                </p>
              )}
              <div style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 4 }}>
                  <span>Имя</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Имя пользователя"
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span>Телефон</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+7XXX..."
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span>E-mail</span>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span>Дата рождения</span>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span>Бонусы</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.bonus}
                    onChange={(e) => setForm((prev) => ({ ...prev, bonus: e.target.value }))}
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={form.notificationsEnabled}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notificationsEnabled: e.target.checked }))
                    }
                  />
                  <span>Уведомления включены</span>
                </label>
                <label style={{ display: "grid", gap: 4 }}>
                  <span>Новый пароль</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Оставьте пустым, чтобы не менять"
                    style={{ padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                </label>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                <button onClick={handleSave} disabled={saving} style={{ padding: "8px 16px" }}>
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  onClick={() => selectedId && fetchDetails(selectedId)}
                  disabled={detailLoading}
                  style={{ padding: "8px 16px" }}
                >
                  Обновить данные
                </button>
              </div>
              {selectedDetail && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={{ marginTop: 0 }}>Последние заказы</h3>
                  {selectedDetail.recentOrders.length === 0 ? (
                    <p>Заказов пока нет</p>
                  ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ border: "1px solid #ccc", padding: 6 }}>ID</th>
                          <th style={{ border: "1px solid #ccc", padding: 6 }}>Статус</th>
                          <th style={{ border: "1px solid #ccc", padding: 6 }}>Тип</th>
                          <th style={{ border: "1px solid #ccc", padding: 6 }}>Сумма</th>
                          <th style={{ border: "1px solid #ccc", padding: 6 }}>Создан</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDetail.recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td style={{ border: "1px solid #ccc", padding: 6 }}>{order.id}</td>
                            <td style={{ border: "1px solid #ccc", padding: 6 }}>{order.status}</td>
                            <td style={{ border: "1px solid #ccc", padding: 6 }}>{order.type}</td>
                            <td style={{ border: "1px solid #ccc", padding: 6 }}>{order.total} ₸</td>
                            <td style={{ border: "1px solid #ccc", padding: 6 }}>{formatDate(order.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {selectedDetail.user.lastOrderAt && (
                    <p style={{ marginTop: 16 }}>
                      Последний заказ: {formatDate(selectedDetail.user.lastOrderAt)}
                    </p>
                  )}
                  <p style={{ marginTop: 8 }}>
                    Аккаунт создан: {formatDate(selectedDetail.user.createdAt)}
                  </p>
                  <p style={{ marginTop: 8 }}>
                    Дата рождения: {formatDateOnly(selectedDetail.user.birthDate)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>Выберите пользователя из списка слева</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
