import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import { useCart } from "../components/CartContext";
import type { OrderDTO } from "@appetit/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function ProfilePage() {
  const { user, open: openAuth, setUser } = useAuth();
  const { setItems } = useCart();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [bonus, setBonus] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [editing, setEditing] = useState(false);
  const [orig, setOrig] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/users/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders);
        setBonus(data.bonus);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setOrig({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
      })
      .catch(() => {});
  }, [user]);

  const reorder = (o: OrderDTO) => {
    const items = o.items.map((i) => ({
      id: i.dishId,
      dishId: i.dishId,
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Данные</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}
            >
              Изменить
            </button>
          )}
        </div>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
            <label>
              Имя
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
            </label>
            <label>
              Телефон
              <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%" }} />
            </label>
            <label>
              Почта
              <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column" }}>
              Пароль
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? "Скрыть" : "Показать"}
                </button>
              </div>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE}/users/${user.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name, email, phone, password: password || undefined }),
                    });
                    if (res.ok) {
                      const u = await res.json();
                      setUser(u);
                      setOrig({ name: u.name || "", email: u.email || "", phone: u.phone || "" });
                      alert("Профиль обновлён");
                      setPassword("");
                      setEditing(false);
                    } else {
                      alert("Не удалось сохранить профиль");
                    }
                  } catch {
                    alert("Не удалось сохранить профиль");
                  }
                }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer" }}
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => {
                  setName(orig.name);
                  setEmail(orig.email);
                  setPhone(orig.phone);
                  setPassword("");
                  setEditing(false);
                }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "#fff", cursor: "pointer" }}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
            <div><strong>Имя:</strong> {name || "—"}</div>
            <div><strong>Телефон:</strong> {phone || "—"}</div>
            <div><strong>Почта:</strong> {email || "—"}</div>
            <div><strong>Пароль:</strong> ********</div>
          </div>
        )}
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

