import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";
import { formatAstanaTime } from "../../../utils/time";

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
  const router = useRouter();
  const { branchId } = router.query as { branchId?: string };

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string>("");

  const load = async () => {
    if (!branchId) return;
    try {
      const res = await fetch(`${API_BASE}/admin/orders?branchId=${branchId}`);
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
    if (!branchId) return;
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [branchId]);

  useEffect(() => {
    if (!branchId) return;
    fetch(`${API_BASE}/branches`)
      .then((r) => r.json())
      .then((list) => {
        const b = list.find((x: any) => x.id === branchId);
        setBranchName(b?.name || "");
      })
      .catch(() => {});
  }, [branchId]);

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
      <h1>Заказы {branchName && `– ${branchName}`}</h1>
      <p>
        <Link href="/admin/orders">Вернуться к списку филиалов</Link>
      </p>
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
              <td>
                {o.id.slice(0, 8)}
                <button
                  style={{ marginLeft: 4 }}
                  onClick={() => navigator.clipboard.writeText(o.id)}
                >
                  📋
                </button>
              </td>
              <td>{o.customerName ?? "—"}</td>
              <td>{o.customerPhone}</td>
              <td>{o.total}</td>
              <td>{o.pickupTime ? formatAstanaTime(o.pickupTime) : "—"}</td>
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
              <td>
                {new Date(o.createdAt).toLocaleString('ru-RU', {
                  hour12: false,
                  timeZone: 'Asia/Almaty',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}

