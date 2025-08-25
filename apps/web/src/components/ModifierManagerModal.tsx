import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Modifier = {
  id: string;
  name: string;
  type: "addon" | "exclusion";
  price: number;
};

interface Props {
  dish: { id: string; name: string };
  onClose: () => void;
}

export default function ModifierManagerModal({ dish, onClose }: Props) {
  const [mods, setMods] = useState<Modifier[]>([]);

  const load = async () => {
    try {
      const data = await fetch(
        `${API_BASE}/admin/dishes/${dish.id}/modifiers`
      ).then((r) => r.json());
      setMods(data);
    } catch {
      setMods([]);
    }
  };

  useEffect(() => {
    load();
  }, [dish.id]);

  const add = async (type: "addon" | "exclusion") => {
    const name = prompt("Название");
    if (!name) return;
    let price = 0;
    if (type === "addon") {
      const p = prompt("Цена", "0");
      if (p === null) return;
      price = Number(p);
    }
    await fetch(`${API_BASE}/admin/dishes/${dish.id}/modifiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, price }),
    });
    load();
  };

  const edit = async (m: Modifier) => {
    const name = prompt("Название", m.name);
    if (!name) return;
    let price = m.price;
    if (m.type === "addon") {
      const p = prompt("Цена", m.price.toString());
      if (p === null) return;
      price = Number(p);
    }
    await fetch(
      `${API_BASE}/admin/dishes/${dish.id}/modifiers/${m.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type: m.type, price }),
      }
    );
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить?")) return;
    await fetch(
      `${API_BASE}/admin/dishes/${dish.id}/modifiers/${id}`,
      { method: "DELETE" }
    );
    load();
  };

  const addons = mods.filter((m) => m.type === "addon");
  const exclusions = mods.filter((m) => m.type === "exclusion");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <h2 style={{ marginTop: 0 }}>Топпинги: {dish.name}</h2>

        <h3>Добавки</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {addons.map((m) => (
            <li key={m.id} className="admin-dish-item">
              <span style={{ flex: 1 }}>
                {m.name} — {m.price}₸
              </span>
              <button onClick={() => edit(m)} className="admin-nav-btn">
                Изм.
              </button>
              <button onClick={() => remove(m.id)} className="admin-nav-btn">
                Удалить
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => add("addon")} className="add-btn">
          Добавить добавку
        </button>

        <h3 style={{ marginTop: 20 }}>Исключения</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {exclusions.map((m) => (
            <li key={m.id} className="admin-dish-item">
              <span style={{ flex: 1 }}>{m.name}</span>
              <button onClick={() => edit(m)} className="admin-nav-btn">
                Изм.
              </button>
              <button onClick={() => remove(m.id)} className="admin-nav-btn">
                Удалить
              </button>
            </li>
          ))}
        </ul>
        <button onClick={() => add("exclusion")} className="add-btn">
          Добавить исключение
        </button>

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button onClick={onClose} className="admin-nav-btn">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
