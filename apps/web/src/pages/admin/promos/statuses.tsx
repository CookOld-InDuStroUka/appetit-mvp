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
    try {
      const res = await fetch(`${API_BASE}/admin/statuses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStatus),
      });
      if (res.ok) {
        alert("Статус добавлен");
        setNewStatus({ name: "", color: "#ff9800" });
        load();
      } else {
        alert("Не удалось добавить статус");
      }
    } catch {
      alert("Не удалось добавить статус");
    }
  };

  const saveStatus = async (st: Status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/statuses/${st.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: st.name, color: st.color }),
      });
      if (res.ok) {
        alert("Сохранено");
        load();
      } else {
        alert("Не удалось сохранить");
      }
    } catch {
      alert("Не удалось сохранить");
    }
  };

  const deleteStatus = async (id: string) => {
    if (!confirm("Удалить статус?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/statuses/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Удалено");
        load();
      } else {
        alert("Не удалось удалить");
      }
    } catch {
      alert("Не удалось удалить");
    }
  };
  const saveDishStatus = async (dish: Dish) => {
    try {
      const res = await fetch(`${API_BASE}/admin/dishes/${dish.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId: dish.statusId ?? null }),
      });
      if (res.ok) {
        alert("Сохранено");
        load();
      } else {
        alert("Не удалось сохранить");
      }
    } catch {
      alert("Не удалось сохранить");
    }
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
                  setDishes((prev) =>
                    prev.map((p) =>
                      p.id === d.id ? { ...p, statusId: e.target.value || null } : p
                    )
                  )
                }
              >
                <option value="">—</option>
                {statuses.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => saveDishStatus(d)}
                className="admin-nav-btn"
              >
                Сохранить
              </button>
            </li>
          ))}
        </ul>
      </section>
    </AdminLayout>
  );
}
