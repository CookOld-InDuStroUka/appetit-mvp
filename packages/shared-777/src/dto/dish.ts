export type DishDTO = {
  id: string;
  name: string;
  nameKz?: string;
  description?: string;
  descriptionKz?: string;
  imageUrl?: string;
  basePrice: number;
  minPrice?: number | null;
  categoryId: string;
};
