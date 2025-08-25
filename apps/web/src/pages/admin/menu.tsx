import AdminLayout from "../../components/AdminLayout";
import { useEffect, useState } from "react";

interface Dish {
  id: string;
  name: string;
  categoryId: string;
  basePrice: number;
}

interface Category {
  id: string;
  name: string;
  dishes: Dish[];
}

export default function MenuAdmin() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";
  const [cats, setCats] = useState<Category[]>([]);

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

  const addDish = async (categoryId: string) => {
    const name = prompt("Название блюда");
    if (!name) return;
    const priceStr = prompt("Цена, ₸");
    const price = Number(priceStr);
    if (!price) return;
    await fetch(`${API_BASE}/admin/dishes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryId, basePrice: price }),
    });
    load();
  };

  const editDish = async (dish: Dish) => {
    const name = prompt("Название блюда", dish.name);
    if (!name) return;
    const priceStr = prompt("Цена, ₸", String(dish.basePrice));
    const price = Number(priceStr);
    if (!price) return;
    await fetch(`${API_BASE}/admin/dishes/${dish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        categoryId: dish.categoryId,
        basePrice: price,
      }),
    });
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
      {cats.map((cat) => (
        <section key={cat.id} style={{ marginBottom: 24 }}>
          <h2>{cat.name}</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cat.dishes.map((d) => (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ flex: 1 }}>
                  {d.name} — {d.basePrice}₸
                </span>
                <button
                  onClick={() => editDish(d)}
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
          <button
            onClick={() => addDish(cat.id)}
            className="add-btn"
          >
            Добавить блюдо
          </button>
        </section>
      ))}
    </AdminLayout>
  );
}
