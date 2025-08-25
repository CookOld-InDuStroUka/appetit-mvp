import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type OrderStatus =
  | "created"
  | "accepted"
  | "cooking"
  | "delivering"
  | "done"
  | "canceled";

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Создан",
  accepted: "Принят",
  cooking: "Готовится",
  delivering: "В пути",
  done: "Завершён",
  canceled: "Отменён",
};

type Order = {
  id: string;
  customerName?: string | null;
  customerPhone: string;
  status: OrderStatus;
  total: number;
  pickupTime?: string | null;
  createdAt: string;
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`);
      if (!res.ok) throw new Error("failed");
      const list = await res.json();
      setOrders(list);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch orders", e);
      setOrders([]);
      setError("Не удалось загрузить заказы");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const update = async (id: string, status: OrderStatus) => {
    await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <AdminLayout>
      <h1>Заказы</h1>
      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}
      <table border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Клиент</th>
            <th>Телефон</th>
            <th>Сумма</th>
            <th>Самовывоз</th>
            <th>Статус</th>
            <th>Создан</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id.slice(0, 8)}</td>
              <td>{o.customerName ?? "—"}</td>
              <td>{o.customerPhone}</td>
              <td>{o.total}</td>
              <td>{o.pickupTime ? new Date(o.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "—"}</td>
              <td>
                <select
                  value={o.status}
                  onChange={(e) => update(o.id, e.target.value as OrderStatus)}
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
              <td>{new Date(o.createdAt).toLocaleString('ru-RU', { hour12: false })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}

