import React from "react";
import { useCart } from "./CartContext";

type Props = {
  dish: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    minPrice?: number;
    basePrice: number;
  };
  onClick: () => void;
};

export default function DishCard({ dish, onClick }: Props) {
  const { addItem } = useCart();
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: dish.id, name: dish.name, price: dish.basePrice, imageUrl: dish.imageUrl, qty: 1 });
  };
  return (
    <div className="dish-card" onClick={onClick} role="button" tabIndex={0}>
      <img
        src={dish.imageUrl || "https://placehold.co/320x180"}
        alt={dish.name}
        style={{ width: "100%", borderRadius: 8 }}
      />
      <h4 style={{ margin: "10px 0 4px" }}>{dish.name}</h4>
      {dish.description && (
        <p className="dish-card-desc">{dish.description}</p>
      )}
      <p className="dish-card-price">
        {dish.minPrice ? `от ${dish.minPrice} ₸` : `${dish.basePrice} ₸`}
      </p>
      <button
        onClick={handleAdd}
        style={{
          marginTop: 8,
          padding: "6px 12px",
          borderRadius: 6,
          border: "1px solid #ef4444",
          background: "#fff",
          color: "#ef4444",
          cursor: "pointer",
        }}
      >
        Добавить
      </button>
    </div>
  );
}
