export type OrderItemInput = {
  dishId: string;
  variantId?: string | null;
  qty: number;
  addonIds?: string[];
  exclusionIds?: string[];
};

export type CreateOrderInput = {
  customer: { phone?: string | null; name?: string | null };
  type: "delivery" | "pickup";
  zoneId?: string | null;
  address?: string | null;
  branchId?: string | null;
  items: OrderItemInput[];
  paymentMethod: "cash" | "card";
  promoCode?: string | null;
  userId?: string;
  bonusToUse?: number;
};

export type OrderStatus =
  | "created"
  | "accepted"
  | "cooking"
  | "delivering"
  | "done"
  | "canceled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: "Создан",
  accepted: "Принят",
  cooking: "Готовится",
  delivering: "В пути",
  done: "Завершён",
  canceled: "Отменён",
};

export type OrderItemDTO = {
  id: string;
  dishId: string;
  variantId?: string | null;
  qty: number;
  unitPrice: number;
  total: number;
  dishName?: string;
  dishImageUrl?: string | null;
  addons?: string[];
  exclusions?: string[];
};

export type OrderDTO = {
  id: string;
  type: "delivery" | "pickup";
  status: OrderStatus;
  customerName?: string | null;
  customerPhone: string;
  address?: string | null;
  zoneId?: string | null;
  branchId?: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  bonusEarned: number;
  bonusUsed: number;
  createdAt: string;
  items: OrderItemDTO[];
};
