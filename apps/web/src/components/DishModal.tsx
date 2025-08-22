import React, { useState } from "react";
import { useCart } from "./CartContext";

type Props = {
  dish: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    basePrice: number;
  } | null;
  onClose: () => void;
};

const DEFAULT_INGREDIENTS = ["Лук", "Помидоры", "Сыр"];
const DEFAULT_SAUCES = ["Сырный", "Чесночный", "Томатный"];

export default function DishModal({ dish, onClose }: Props) {
  const [excluded, setExcluded] = useState<string[]>([]);
  const [sauces, setSauces] = useState<string[]>([]);
  const { addItem } = useCart();

  if (!dish) return null;

  const toggle = (ing: string) => {
    setExcluded((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const toggleSauce = (s: string) => {
    setSauces((prev) =>
      prev.includes(s) ? prev.filter((i) => i !== s) : [...prev, s]
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close" aria-label="Закрыть">
          ×
        </button>
        <img
          src={dish.imageUrl || "https://placehold.co/600x400"}
          alt={dish.name}
          style={{ width: "100%", borderRadius: 8 }}
        />
        <h2>{dish.name}</h2>
        {dish.description && <p>{dish.description}</p>}
        <h4 style={{ marginTop: 20 }}>Ингредиенты</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {DEFAULT_INGREDIENTS.map((ing) => (
            <li key={ing} style={{ marginBottom: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={!excluded.includes(ing)}
                  onChange={() => toggle(ing)}
                />{" "}
                {ing}
              </label>
            </li>
          ))}
        </ul>
        <h4 style={{ marginTop: 20 }}>Соусы</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {DEFAULT_SAUCES.map((s) => (
            <li key={s} style={{ marginBottom: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={sauces.includes(s)}
                  onChange={() => toggleSauce(s)}
                />{" "}
                {s}
              </label>
            </li>
          ))}
        </ul>
        <p style={{ fontWeight: 600 }}>
          Цена: {dish.basePrice} ₸
        </p>
        <button
          onClick={() =>
            addItem({
              id: dish.id,
              name: dish.name,
              price: dish.basePrice,
              imageUrl: dish.imageUrl,
              qty: 1,
            })
          }
          className="add-btn"
          style={{ marginTop: 12, padding: "10px 16px" }}
          aria-label="Добавить"
        >
          +
        </button>
      </div>
    </div>
  );
}
