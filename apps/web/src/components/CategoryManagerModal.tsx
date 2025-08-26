import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

interface Category {
  id: string;
  name: string;
  nameKz?: string;
  sortOrder: number;
}

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function CategoryManagerModal({ onClose, onSaved }: Props) {
  const [cats, setCats] = useState<Category[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/admin/categories`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setCats(d));
  }, []);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const add = () =>
    setCats([...cats, { id: `new-${Date.now()}`, name: "", nameKz: "", sortOrder: cats.length }]);

  const updateName = (idx: number, name: string) => {
    const copy = [...cats];
    copy[idx].name = name;
    setCats(copy);
  };

  const updateNameKz = (idx: number, nameKz: string) => {
    const copy = [...cats];
    copy[idx].nameKz = nameKz;
    setCats(copy);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= cats.length) return;
    const copy = [...cats];
    const tmp = copy[idx];
    copy[idx] = copy[newIdx];
    copy[newIdx] = tmp;
    setCats(copy);
  };

  const remove = (idx: number) => {
    const cat = cats[idx];
    if (!cat.id.startsWith("new-")) setRemoved([...removed, cat.id]);
    setCats(cats.filter((_, i) => i !== idx));
  };

  const save = async () => {
    for (let i = 0; i < cats.length; i++) {
      const c = cats[i];
      const payload = { name: c.name, nameKz: c.nameKz || null, sortOrder: i };
      if (c.id.startsWith("new-")) {
        await fetch(`${API_BASE}/admin/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`${API_BASE}/admin/categories/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    }
    for (const id of removed) {
      await fetch(`${API_BASE}/admin/categories/${id}`, { method: "DELETE" });
    }
    onSaved();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={stop}>
        <h2 style={{ marginTop: 0 }}>Типы блюд</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cats.map((c, idx) => (
            <div key={c.id} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <input
                value={c.name}
                onChange={(e) => updateName(idx, e.target.value)}
                placeholder="Название"
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <input
                value={c.nameKz || ""}
                onChange={(e) => updateNameKz(idx, e.target.value)}
                placeholder="Название (каз.)"
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
              />
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => move(idx, -1)} className="admin-nav-btn">
                  ↑
                </button>
                <button onClick={() => move(idx, 1)} className="admin-nav-btn">
                  ↓
                </button>
                <button onClick={() => remove(idx)} className="admin-nav-btn">
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button onClick={add} className="add-btn">
            Добавить тип
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
