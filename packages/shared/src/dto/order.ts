export type OrderItemInput = {
  dishId: string;
  variantId?: string | null;
  qty: number;
};

export type CreateOrderInput = {
  customer: { phone: string; name?: string | null };
  type: "delivery" | "pickup";
  zoneId?: string | null;
  address?: string | null;
  branchId?: string | null;
  items: OrderItemInput[];
  paymentMethod: "cash" | "card";
  promoCode?: string | null;
};

export type OrderStatus =
  | "created"
  | "accepted"
  | "cooking"
  | "delivering"
  | "done"
  | "canceled";

export type OrderItemDTO = {
  id: string;
  dishId: string;
  variantId?: string | null;
  qty: number;
  unitPrice: number;
  total: number;
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
  createdAt: string;
  items: OrderItemDTO[];
};
