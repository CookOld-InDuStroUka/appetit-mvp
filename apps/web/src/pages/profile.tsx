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
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  };

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
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", overflow: "hidden", background: "var(--border)" }}>
            {photoUrl && (
              <img src={photoUrl} alt="Фото профиля" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8 }}>Загрузить фото</label>
            <input type="file" accept="image/*" onChange={handlePhoto} />
          </div>
        </div>
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
        <table style={{ borderCollapse: "collapse", maxWidth: 400 }}>
          <tbody>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>Имя</th>
              <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>{user.name ?? "—"}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>Телефон</th>
              <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>{user.phone ?? "—"}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>Почта</th>
              <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>{user.email ?? "—"}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>Дата рождения</th>
              <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--border)" }}>{user.birthDate ? user.birthDate.slice(0, 10) : "—"}</td>
            </tr>
            <tr>
              <th style={{ textAlign: "left", padding: "4px 8px" }}>Пароль</th>
              <td style={{ padding: "4px 8px" }}>********</td>
            </tr>
          </tbody>
        </table>
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
                <div style={{ marginTop: 8 }}>
                  <a href={`/orders/${o.id}`} style={{ color: "var(--accent)" }}>Подробнее</a>
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

