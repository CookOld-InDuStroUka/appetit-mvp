// types/cart.ts
export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  dishId?: string;
  category?: string;
  addons?: { id: string; name: string; price: number }[];
  excluded?: { id: string; name: string }[];
};
