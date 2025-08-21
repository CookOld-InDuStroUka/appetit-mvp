import React, { useState } from "react";

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

export default function DishModal({ dish, onClose }: Props) {
  const [excluded, setExcluded] = useState<string[]>([]);

  if (!dish) return null;

  const toggle = (ing: string) => {
    setExcluded((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
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
        <p style={{ fontWeight: 600 }}>
          Цена: {dish.basePrice} ₸
        </p>
      </div>
    </div>
  );
}
