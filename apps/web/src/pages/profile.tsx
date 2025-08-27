import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import UserInfoModal from "../components/UserInfoModal";
import type { OrderDTO } from "@appetit/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function ProfilePage() {
  const { user, setUser, open: openAuth, logout } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_BASE}/users/${user.id}`)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data.orders) ? data.orders : []))
      .catch(() => {});
  }, [user]);

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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>Профиль</h1>
          <button
            onClick={logout}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "#fff", cursor: "pointer" }}
          >
            Выйти
          </button>
        </div>
        <p>Бонусы: {user.bonus ?? 0} ₸</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Данные</h2>
          <button
            onClick={() => setShowEdit(true)}
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Изменить
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400 }}>
          <div><strong>Имя:</strong> {user.name ?? "—"}</div>
          <div><strong>Телефон:</strong> {user.phone ?? "—"}</div>
          <div><strong>Почта:</strong> {user.email ?? "—"}</div>
          <div><strong>Дата рождения:</strong> {user.birthDate ? user.birthDate.slice(0, 10) : "—"}</div>
          <div><strong>Пароль:</strong> ********</div>
        </div>
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
                  <span>{new Date(o.createdAt).toLocaleString("ru-RU", { hour12: false })}</span>
                  <span>{o.total} ₸</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
      {showEdit && user && (
        <UserInfoModal
          user={user}
          onClose={() => setShowEdit(false)}
          onSaved={(u) => {
            setUser(u);
            setShowEdit(false);
          }}
        />
      )}
    </>
  );
}

