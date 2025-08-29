import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

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
  const [removed, setRemoved] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/dishes/${dish.id}/modifiers`)
      .then((r) => r.json())
      .then((d) => setMods(d))
      .catch(() => setMods([]));
  }, [dish.id]);

  const add = (type: "addon" | "exclusion") => {
    setMods([
      ...mods,
      { id: `new-${Date.now()}`, name: "", price: 0, type },
    ]);
  };

  const update = (id: string, field: "name" | "price", value: string) => {
    setMods(
      mods.map((m) =>
        m.id === id ? { ...m, [field]: field === "price" ? Number(value) : value } : m
      )
    );
  };

  const remove = (id: string) => {
    if (!id.startsWith("new-")) setRemoved([...removed, id]);
    setMods(mods.filter((m) => m.id !== id));
  };

  const save = async () => {
    try {
      for (const m of mods) {
        if (!m.name.trim()) continue;
        const payload = {
          name: m.name.trim(),
          type: m.type,
          price: Number.isFinite(m.price) ? m.price : 0,
        };
        const url = m.id.startsWith("new-")
          ? `${API_BASE}/admin/dishes/${dish.id}/modifiers`
          : `${API_BASE}/admin/dishes/${dish.id}/modifiers/${m.id}`;
        const method = m.id.startsWith("new-") ? "POST" : "PUT";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("save failed");
      }
      for (const id of removed) {
        const res = await fetch(
          `${API_BASE}/admin/dishes/${dish.id}/modifiers/${id}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("delete failed");
      }
      onClose();
    } catch {
      alert("Не удалось сохранить модификаторы");
    }
  };

  const addons = mods.filter((m) => m.type === "addon");
  const exclusions = mods.filter((m) => m.type === "exclusion");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400 }}
      >
        <h2 style={{ marginTop: 0 }}>Топпинги: {dish.name}</h2>

        <h3>Добавки</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {addons.map((m) => (
            <div key={m.id} style={{ display: "flex", gap: 4 }}>
              <input
                value={m.name}
                onChange={(e) => update(m.id, "name", e.target.value)}
                placeholder="Название"
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <input
                type="number"
                value={m.price}
                onChange={(e) => update(m.id, "price", e.target.value)}
                style={{ width: 70, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <button onClick={() => remove(m.id)} className="admin-nav-btn">
                ✕
              </button>
            </div>
          ))}
          <button onClick={() => add("addon")} className="add-btn">
            Добавить добавку
          </button>
        </div>

        <h3 style={{ marginTop: 20 }}>Исключения</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {exclusions.map((m) => (
            <div key={m.id} style={{ display: "flex", gap: 4 }}>
              <input
                value={m.name}
                onChange={(e) => update(m.id, "name", e.target.value)}
                placeholder="Название"
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <button onClick={() => remove(m.id)} className="admin-nav-btn">
                ✕
              </button>
            </div>
          ))}
          <button onClick={() => add("exclusion")} className="add-btn">
            Добавить исключение
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={onClose} className="admin-nav-btn">
            Отмена
          </button>
          <button onClick={save} className="add-btn">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
