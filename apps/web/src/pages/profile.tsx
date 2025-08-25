import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import { useCart } from "../components/CartContext";
import type { OrderDTO } from "@appetit/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function ProfilePage() {
  const { user, open: openAuth } = useAuth();
  const { setItems } = useCart();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [bonus, setBonus] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/users/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders);
        setBonus(data.bonus);
      })
      .catch(() => {});
  }, [user]);

  const reorder = (o: OrderDTO) => {
    const items = o.items.map((i) => ({
      id: i.dishId,
      name: i.dishName || "Блюдо",
      price: i.unitPrice,
      qty: i.qty,
    }));
    setItems(items);
    alert("Товары из заказа добавлены в корзину");
  };

  if (!user) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
          <p>Для просмотра профиля необходимо войти.</p>
          <button
            onClick={openAuth}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}
          >
            Войти
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        <h1>Профиль</h1>
        <p>Бонусы: {bonus} ₸</p>
        <h2>История заказов</h2>
        {orders.length === 0 ? (
          <p>Заказов пока нет</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {orders.map((o) => (
              <li
                key={o.id}
                style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>{new Date(o.createdAt).toLocaleString("ru-RU")}</span>
                  <span>{o.total} ₸</span>
                </div>
                <button
                  onClick={() => reorder(o)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}
                >
                  Повторить
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
