import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../components/AuthContext";
import type { OrderDTO } from "@appetit/shared";
import { formatAstanaTime } from "../utils/time";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

const ORDER_STATUS_LABELS: Record<string, string> = {
  created: "Создан",
  accepted: "Принят",
  cooking: "Готовится",
  delivering: "В пути",
  done: "Завершён",
  canceled: "Отменён",
};

export default function OrdersPage() {
  const { user, open: openAuth } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);

  const load = () => {
    if (!user) return;
    fetch(`${API_BASE}/users/${user.id}`)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [user]);

  if (!user) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
          <p>Для просмотра заказов необходимо войти.</p>
          <button
            onClick={openAuth}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff" }}
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
        <h1>Мои заказы</h1>
        {orders.length === 0 ? (
          <p>Заказов нет</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {orders.map((o) => (
              <li
                key={o.id}
                style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12, marginBottom: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span>#{o.id.slice(0, 8)}</span>
                  <span>
                    {new Date(o.createdAt).toLocaleString("ru-RU", {
                      hour12: false,
                      timeZone: "Asia/Almaty",
                    })}
                  </span>
                </div>
                <div>Статус: {ORDER_STATUS_LABELS[o.status]}</div>
                <div>Тип: {o.type === "delivery" ? "Доставка" : "Самовывоз"}</div>
                {o.type === "delivery" ? (
                  <div>Примерное время прибытия: —</div>
                ) : (
                  <>
                    <div>Самовывоз: {o.pickupTime ? formatAstanaTime(o.pickupTime) : "—"}</div>
                    <div>Код выдачи: {o.pickupCode ?? "—"}</div>
                    {o.pickupCode && (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${o.pickupCode}`}
                        alt="QR"
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </>
                )}
                <div>Промокод: {o.promoCode ?? "—"}</div>
                <div>Сумма: {o.total} ₸</div>
                <div style={{ marginTop: 8 }}>
                  <a href={`/orders/${o.id}`} style={{ color: "var(--accent)" }}>Подробнее</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
