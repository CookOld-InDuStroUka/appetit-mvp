import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

interface Status {
  id: string;
  name: string;
  color: string;
}

interface Dish {
  id: string;
  name: string;
  statusId?: string | null;
}

export default function DishStatusesPage() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [newStatus, setNewStatus] = useState<{ name: string; color: string }>(
    { name: "", color: "#ff9800" }
  );

  const load = async () => {
    const s = await fetch(`${API_BASE}/admin/statuses`).then((r) => r.json());
    setStatuses(s);
    const cats = await fetch(`${API_BASE}/admin/dishes`).then((r) => r.json());
    const all: Dish[] = cats.flatMap((c: any) => c.dishes);
    setDishes(all);
  };

  useEffect(() => {
    load();
  }, [API_BASE]);

  const addStatus = async () => {
    if (!newStatus.name) return;
    await fetch(`${API_BASE}/admin/statuses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStatus),
    });
    setNewStatus({ name: "", color: "#ff9800" });
    load();
  };

  const saveStatus = async (st: Status) => {
    await fetch(`${API_BASE}/admin/statuses/${st.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: st.name, color: st.color }),
    });
    load();
  };

  const deleteStatus = async (id: string) => {
    if (!confirm("Удалить статус?")) return;
    await fetch(`${API_BASE}/admin/statuses/${id}`, { method: "DELETE" });
    load();
  };

  const setDishStatus = async (dishId: string, statusId: string | null) => {
    await fetch(`${API_BASE}/admin/dishes/${dishId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId }),
    });
    load();
  };

  return (
    <AdminLayout>
      <h1>Статусы блюд</h1>
      <section style={{ marginBottom: 24 }}>
        <h2>Список статусов</h2>
        {statuses.map((st) => (
          <div key={st.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              value={st.name}
              onChange={(e) =>
                setStatuses((prev) =>
                  prev.map((p) => (p.id === st.id ? { ...p, name: e.target.value } : p))
                )
              }
            />
            <input
              type="color"
              value={st.color}
              onChange={(e) =>
                setStatuses((prev) =>
                  prev.map((p) => (p.id === st.id ? { ...p, color: e.target.value } : p))
                )
              }
            />
            <button onClick={() => saveStatus(st)} className="admin-nav-btn">
              Сохранить
            </button>
            <button onClick={() => deleteStatus(st.id)} className="admin-nav-btn">
              Удалить
            </button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            placeholder="Название"
            value={newStatus.name}
            onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
          />
          <input
            type="color"
            value={newStatus.color}
            onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
          />
          <button onClick={addStatus} className="admin-nav-btn">
            Добавить
          </button>
        </div>
      </section>

      <section>
        <h2>Привязка к блюдам</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {dishes.map((d) => (
            <li
              key={d.id}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
            >
              <span style={{ flex: 1 }}>{d.name}</span>
              <select
                value={d.statusId ?? ""}
                onChange={(e) =>
                  setDishStatus(d.id, e.target.value || null)
                }
              >
                <option value="">—</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </section>
    </AdminLayout>
  );
}
