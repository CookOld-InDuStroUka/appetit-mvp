import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "../../../components/AdminLayout";
import { formatAstanaTime } from "../../../utils/time";
import OrderDetailsModal, { Order, OrderStatus } from "../../../components/OrderDetailsModal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Новый",
  accepted: "Принят",
  cooking: "Готовится",
  delivering: "В пути",
  done: "Завершён",
  canceled: "Отменён",
};

const ORDER_FLOW: OrderStatus[] = [
  "created",
  "accepted",
  "cooking",
  "delivering",
  "done",
];

const nextStatus = (s: OrderStatus): OrderStatus => {
  if (s === "done" || s === "canceled") return s;
  const idx = ORDER_FLOW.indexOf(s);
  return ORDER_FLOW[idx + 1] || s;
};

export default function OrdersAdmin() {
  const router = useRouter();
  const { branchId } = router.query as { branchId?: string };

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string>("");
  const [selected, setSelected] = useState<Order | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const [hasNew, setHasNew] = useState(false);

  const load = async () => {
    if (!branchId) return;
    try {
      const res = await fetch(`${API_BASE}/admin/orders?branchId=${branchId}`);
      if (!res.ok) throw new Error("failed");
      const list: Order[] = await res.json();
      const newOnes = list.filter(
        (o) => !seenIds.current.has(o.id) && o.status === "created"
      );
      if (newOnes.length > 0) {
        setHasNew(true);
      }
      seenIds.current = new Set(list.map((o) => o.id));
      setOrders(list);
      setHasNew(list.some((o) => o.status === "created"));
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
      {hasNew && (
        <div
          style={{
            position: "fixed",
            right: 20,
            top: 100,
            background: "#ff9800",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          Новый заказ
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Клиент</th>
            <th>Телефон</th>
            <th>Сумма</th>
            <th>Код</th>
            <th>Промокод</th>
            <th>Самовывоз</th>
            <th>Статус</th>
            <th>Создан</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr
              key={o.id}
              style={{ background: o.status === "created" ? "#fff6e5" : undefined }}
            >
              <td>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setSelected(o)}
                >
                  {o.id.slice(0, 8)}
                </button>
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
              <td>{o.pickupCode ?? "—"}</td>
              <td>{o.promoCode ?? "—"}</td>
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
                <button
                  style={{ marginLeft: 4 }}
                  onClick={() => update(o.id, nextStatus(o.status))}
                  disabled={o.status === "done" || o.status === "canceled"}
                >
                  ▶
                </button>
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
      {selected && (
        <OrderDetailsModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(s) => update(selected.id, s)}
        />
      )}
    </AdminLayout>
  );
}

