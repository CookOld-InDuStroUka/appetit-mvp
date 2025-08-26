import AdminLayout from "../../components/AdminLayout";
import { useEffect, useState } from "react";
import DishFormModal from "../../components/DishFormModal";
import CategoryManagerModal from "../../components/CategoryManagerModal";
import ModifierManagerModal from "../../components/ModifierManagerModal";

interface Dish {
  id: string;
  name: string;
  nameKz?: string | null;
  categoryId: string;
  basePrice: number;
  description?: string | null;
  descriptionKz?: string | null;
  imageUrl?: string | null;
}

interface Category {
  id: string;
  name: string;
  nameKz?: string | null;
  dishes: Dish[];
}

export default function MenuAdmin() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";
  const [cats, setCats] = useState<Category[]>([]);
  const [editor, setEditor] = useState<{
    dish?: Dish;
    initialCategoryId?: string;
  } | null>(null);
  const [manageCats, setManageCats] = useState(false);
  const [modDish, setModDish] = useState<Dish | null>(null);

  const load = async () => {
    try {
      const d = await fetch(`${API_BASE}/admin/dishes`).then((r) => r.json());
      setCats(d);
    } catch {
      setCats([]);
    }
  };

  useEffect(() => {
    load();
  }, [API_BASE]);

  const openAdd = (categoryId: string) => setEditor({ initialCategoryId: categoryId });
  const openEdit = (dish: Dish) => setEditor({ dish });
  const closeEditor = () => setEditor(null);
  const saved = () => {
    setEditor(null);
    load();
  };

  const delDish = async (id: string) => {
    if (!confirm("Удалить блюдо?")) return;
    await fetch(`${API_BASE}/admin/dishes/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminLayout>
      <h1>Меню и ассортимент</h1>
      <button
        onClick={() => setManageCats(true)}
        className="admin-nav-btn"
        style={{ marginBottom: 24 }}
      >
        Управление типами блюд
      </button>
      {cats.map((cat) => (
        <section key={cat.id} style={{ marginBottom: 24 }}>
          <h2>{cat.name}</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cat.dishes.map((d) => (
              <li key={d.id} className="admin-dish-item">
                <span style={{ flex: 1 }}>
                  {d.name} — {d.basePrice}₸
                </span>
                <button
                  onClick={() => setModDish(d)}
                  className="admin-nav-btn"
                >
                  Топпинги
                </button>
                <button
                  onClick={() => openEdit(d)}
                  className="admin-nav-btn"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => delDish(d.id)}
                  className="admin-nav-btn"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => openAdd(cat.id)} className="add-btn">
            Добавить блюдо
          </button>
        </section>
      ))}
      {editor && (
        <DishFormModal
          categories={cats.map(({ id, name }) => ({ id, name }))}
          dish={editor.dish}
          initialCategoryId={editor.initialCategoryId}
          onClose={closeEditor}
          onSaved={saved}
        />
      )}
      {manageCats && (
        <CategoryManagerModal
          onClose={() => setManageCats(false)}
          onSaved={() => {
            setManageCats(false);
            load();
          }}
        />
      )}
      {modDish && (
        <ModifierManagerModal
          dish={modDish}
          onClose={() => setModDish(null)}
        />
      )}
    </AdminLayout>
  );
}
