export type DishDTO = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  minPrice?: number | null;
  categoryId: string;
};
