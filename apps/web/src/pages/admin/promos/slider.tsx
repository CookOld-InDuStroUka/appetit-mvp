import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { PromoSlide } from "../../../types/promo";
import { Branch } from "../../../components/PickupMap";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function SliderAdmin() {
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<PromoSlide>({ image: "" });
  const [uploading, setUploading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("promoSlides") : null;
    if (saved) {
      try {
        setSlides(JSON.parse(saved));
      } catch {
        setSlides([]);
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/branches`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBranches(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("promoSlides", JSON.stringify(slides));
    }
  }, [slides]);

  const startEdit = (idx: number) => {
    setEditing(idx);
    setForm(slides[idx]);
  };

  const clearForm = () => {
    setEditing(null);
    setForm({ image: "" });
  };

  const saveSlide = () => {
    if (!form.image) return;
    if (editing === null) setSlides([...slides, form]);
    else setSlides(slides.map((s, i) => (i === editing ? form : s)));
    clearForm();
  };

  const removeSlide = (idx: number) => {
    setSlides(slides.filter((_, i) => i !== idx));
    if (editing === idx) clearForm();
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
        if (data.url) setForm({ ...form, image: data.url });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AdminLayout>
      <h1>Слайдер</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 500 }}>
        <div>
          {form.image && (
            <img
              src={form.image}
              alt="preview"
              style={{ maxWidth: "100%", display: "block", marginBottom: 8 }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
          {uploading && <div>Загрузка...</div>}
        </div>
        <input
          type="text"
          placeholder="Ссылка"
          value={form.link || ""}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
        />
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={!!form.modal}
            onChange={(e) =>
              setForm({
                ...form,
                modal: e.target.checked
                  ? { title: "", text: "" }
                  : undefined,
              })
            }
          />
          Модальное окно
        </label>
        {form.modal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 16 }}>
            <input
              type="text"
              placeholder="Заголовок"
              value={form.modal.title}
              onChange={(e) =>
                setForm({ ...form, modal: { ...form.modal!, title: e.target.value } })
              }
            />
            <textarea
              placeholder="Текст"
              value={form.modal.text}
              onChange={(e) =>
                setForm({ ...form, modal: { ...form.modal!, text: e.target.value } })
              }
            />
            <input
              type="text"
              placeholder="Промокод"
              value={form.modal.promoCode || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  modal: { ...form.modal!, promoCode: e.target.value },
                })
              }
            />
            <select
              value={form.modal.branchId || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  modal: {
                    ...form.modal!,
                    branchId: e.target.value || undefined,
                  },
                })
              }
            >
              <option value="">Все филиалы</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Текст для поделиться"
              value={form.modal.shareText || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  modal: { ...form.modal!, shareText: e.target.value },
                })
              }
            />
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={saveSlide}>{editing === null ? "Добавить" : "Сохранить"}</button>
          {editing !== null && <button onClick={clearForm}>Отмена</button>}
        </div>
      </div>
      <ul style={{ marginTop: 24 }}>
        {slides.map((s, i) => (
          <li key={i} style={{ marginBottom: 12 }}>
            <img src={s.image} alt="" style={{ maxWidth: 200, display: "block" }} />
            {s.link && <div>{s.link}</div>}
            {s.modal && (
              <div>
                Модальное окно: {s.modal.title || "(без названия)"}
                {s.modal.branchId && (
                  <div>
                    Филиал: {branches.find((b) => b.id === s.modal!.branchId)?.name || s.modal.branchId}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => startEdit(i)} style={{ marginRight: 8 }}>
              Редактировать
            </button>
            <button onClick={() => removeSlide(i)}>Удалить</button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
