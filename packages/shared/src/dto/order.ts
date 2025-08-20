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
};
