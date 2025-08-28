import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import type { OrderDTO } from "@appetit/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

const ORDER_STATUS_LABELS: Record<string, string> = {
  created: "Принят",
  accepted: "Подтвержден",
  cooking: "Готовится",
  delivering: "В доставке",
  done: "Завершен",
  canceled: "Отменен",
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    fetch(`${API_BASE}/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load order");
        return r.json();
      })
      .then((data) => setOrder(data))
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <>
      <Header />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
        <button
          onClick={() => router.back()}
          style={{ marginBottom: 12, border: "1px solid var(--border)", background: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
        >
          ← Назад
        </button>

        {!order && !error && <p>Загрузка заказа…</p>}
        {error && <p style={{ color: "#c00" }}>Ошибка: {error}</p>}
        {order && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h1 style={{ margin: 0 }}>Заказ #{order.id.slice(0, 8)}</h1>
              <span style={{ fontWeight: 600 }}>
                {new Date(order.createdAt).toLocaleString("ru-RU", { hour12: false, timeZone: "Asia/Almaty" })}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div><strong>Статус:</strong> {ORDER_STATUS_LABELS[order.status]}</div>
              <div><strong>Тип:</strong> {order.type === "delivery" ? "Доставка" : "Самовывоз"}</div>
              <div><strong>Оплата:</strong> {order.paymentMethod}</div>
              <div><strong>Состояние оплаты:</strong> {order.paymentStatus}</div>
              {order.type === "delivery" ? (
                <div style={{ gridColumn: "1 / -1" }}><strong>Адрес доставки:</strong> {order.address || "—"}</div>
              ) : (
                <>
                  <div><strong>Время самовывоза:</strong> {order.pickupTime ? new Date(order.pickupTime).toLocaleString("ru-RU", { hour12: false, timeZone: "Asia/Almaty" }) : "—"}</div>
                  <div><strong>Код выдачи:</strong> {order.pickupCode || "—"}</div>
                </>
              )}
              <div><strong>Клиент:</strong> {order.customerName || "—"}</div>
              <div><strong>Телефон:</strong> {order.customerPhone}</div>
              <div><strong>Промокод:</strong> {order.promoCode || "—"}</div>
            </div>

            <h2 style={{ marginTop: 0 }}>Состав заказа</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {order.items.map((it) => (
                <li key={it.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {it.dishImageUrl && (
                    <img src={it.dishImageUrl} alt={it.dishName || "Dish"} width={64} height={64} style={{ objectFit: "cover", borderRadius: 8 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{it.dishName || it.dishId}</div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      x{it.qty} • {it.unitPrice} ₸ = {it.total} ₸
                    </div>
                    {(it.addons?.length || it.exclusions?.length) && (
                      <div style={{ color: "#555", fontSize: 12 }}>
                        {it.addons?.length ? `Добавки: ${it.addons.join(", ")}` : ""}
                        {it.addons?.length && it.exclusions?.length ? " • " : ""}
                        {it.exclusions?.length ? `Исключения: ${it.exclusions.join(", ")}` : ""}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginTop: 16 }}>
              <div>Подытог</div><div>{order.subtotal} ₸</div>
              <div>Доставка</div><div>{order.deliveryFee} ₸</div>
              <div>Скидка</div><div>-{order.discount} ₸</div>
              <div>Бонусы списано</div><div>-{order.bonusUsed} ₸</div>
              <div style={{ fontWeight: 700 }}>Итого</div><div style={{ fontWeight: 700 }}>{order.total} ₸</div>
            </div>

            <div style={{ marginTop: 20 }}>
              <h3 style={{ marginTop: 0 }}>QR для выдачи</h3>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(order.pickupCode || order.id)}`}
                alt="QR"
              />
              <div style={{ color: "#666", fontSize: 12, marginTop: 6 }}>
                Покажите этот QR при получении заказа
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
