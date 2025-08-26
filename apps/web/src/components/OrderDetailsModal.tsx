import React from "react";

export type OrderStatus =
  | "created"
  | "accepted"
  | "cooking"
  | "delivering"
  | "done"
  | "canceled";

const STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Новый",
  accepted: "Принят",
  cooking: "Готовится",
  delivering: "В пути",
  done: "Завершён",
  canceled: "Отменён",
};

export type OrderItem = {
  id: string;
  dishId: string;
  dishName: string | null;
  variantId?: string | null;
  qty: number;
  unitPrice: number;
  total: number;
  addons: string[];
  exclusions: string[];
};

export type Order = {
  id: string;
  type: string;
  status: OrderStatus;
  customerName?: string | null;
  customerPhone: string;
  address?: string | null;
  pickupTime?: string | null;
  pickupCode?: string | null;
  promoCode?: string | null;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

interface Props {
  order: Order;
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
}

export default function OrderDetailsModal({ order, onClose, onStatusChange }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          maxWidth: 500,
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Заказ {order.id.slice(0, 8)}</h2>
        <p>
          <strong>Статус: </strong>
          <select value={order.status} onChange={(e) => onStatusChange(e.target.value as OrderStatus)}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </p>
        <p>
          <strong>Клиент:</strong> {order.customerName || "—"} ({order.customerPhone})
        </p>
        {order.address && (
          <p>
            <strong>Адрес:</strong> {order.address}
          </p>
        )}
        {order.pickupTime && (
          <p>
            <strong>Самовывоз:</strong> {new Date(order.pickupTime).toLocaleString("ru-RU", {
              hour12: false,
              timeZone: "Asia/Almaty",
            })}
          </p>
        )}
        {order.promoCode && (
          <p>
            <strong>Промокод:</strong> {order.promoCode}
          </p>
        )}
        <h3>Позиции</h3>
        <ul>
          {order.items.map((i) => (
            <li key={i.id}>
              {i.dishName || i.dishId} × {i.qty} – {i.total}
            </li>
          ))}
        </ul>
        <p>
          <strong>Итого: </strong>
          {order.total}
        </p>
        <div style={{ textAlign: "right" }}>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}
