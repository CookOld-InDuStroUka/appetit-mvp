import React, { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Dish = {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
  description?: string | null;
  imageUrl?: string | null;
};

type Category = { id: string; name: string };

interface Props {
  categories: Category[];
  dish?: Dish;
  initialCategoryId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function DishFormModal({
  categories,
  dish,
  initialCategoryId,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(dish?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    dish?.categoryId ?? initialCategoryId ?? categories[0]?.id ?? ""
  );
  const [basePrice, setBasePrice] = useState(dish?.basePrice ?? 0);
  const [description, setDescription] = useState(dish?.description ?? "");
  const [imageUrl, setImageUrl] = useState(dish?.imageUrl ?? "");

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      categoryId,
      basePrice: Number(basePrice),
      description: description || null,
      imageUrl: imageUrl || null,
    };
    await fetch(
      dish ? `${API_BASE}/admin/dishes/${dish.id}` : `${API_BASE}/admin/dishes`,
      {
        method: dish ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    onSaved();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={stop}>
        <h2 style={{ marginTop: 0 }}>
          {dish ? "Редактировать блюдо" : "Добавить блюдо"}
        </h2>
        <form
          onSubmit={save}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название"
            required
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            placeholder="Цена"
            required
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Ссылка на изображение"
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={3}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              className="admin-nav-btn"
            >
              Отмена
            </button>
            <button type="submit" className="add-btn">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

