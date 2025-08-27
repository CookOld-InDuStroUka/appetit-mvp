import type { OrderDTO } from "./order";

export type UserDTO = {
  id: string;
  phone?: string | null;
  email?: string | null;
  name?: string | null;
  bonus: number;
};

export type UserProfileDTO = UserDTO & { orders: OrderDTO[] };
