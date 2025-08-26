import React, { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Dish = {
  id: string;
  name: string;
  nameKz?: string | null;
  categoryId: string;
  basePrice: number;
  description?: string | null;
  descriptionKz?: string | null;
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
  const [nameKz, setNameKz] = useState(dish?.nameKz ?? "");
  const [categoryId, setCategoryId] = useState(
    dish?.categoryId ?? initialCategoryId ?? categories[0]?.id ?? ""
  );
  const [basePrice, setBasePrice] = useState(dish?.basePrice ?? 0);
  const [description, setDescription] = useState(dish?.description ?? "");
  const [descriptionKz, setDescriptionKz] = useState(dish?.descriptionKz ?? "");
  const [imageUrl, setImageUrl] = useState(dish?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      nameKz: nameKz || null,
      categoryId,
      basePrice: Number(basePrice),
      description: description || null,
      descriptionKz: descriptionKz || null,
      imageUrl: imageUrl || null,
    };
    try {
      const res = await fetch(
        dish ? `${API_BASE}/admin/dishes/${dish.id}` : `${API_BASE}/admin/dishes`,
        {
          method: dish ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed");
      onSaved();
    } catch {
      alert("Не удалось сохранить блюдо");
    }
  };

  const uploadImage = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setUploading(true);
      try {
        const res = await fetch(`${API_BASE}/admin/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
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
          <input
            value={nameKz}
            onChange={(e) => setNameKz(e.target.value)}
            placeholder="Название (каз.)"
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
          <div>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                style={{ maxWidth: "100%", marginBottom: 8, borderRadius: 8 }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            />
            {uploading && <p>Загрузка...</p>}
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            rows={3}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}
          />
          <textarea
            value={descriptionKz}
            onChange={(e) => setDescriptionKz(e.target.value)}
            placeholder="Описание (каз.)"
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

