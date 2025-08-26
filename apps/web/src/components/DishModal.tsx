import React, { useState } from "react";
import { useCart } from "./CartContext";

type Dish = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
};

type Props = {
  dish: Dish | null;
  onClose: () => void;
};

type Ing = { id: string; name: string };
type Topping = { id: string; name: string; price: number };

const DEFAULT_INGREDIENTS: Ing[] = [
  { id: "onion", name: "Лук" },
  { id: "tomato", name: "Помидоры" },
  { id: "cheese", name: "Сыр" },
];

const TOPPINGS: Topping[] = [
  { id: "extra_cheese", name: "Доп. сыр", price: 200 },
  { id: "sauce", name: "Доп. соус", price: 100 },
];

export default function DishModal({ dish, onClose }: Props) {
  const { addItem } = useCart();
  const [excluded, setExcluded] = useState<string[]>([]);
  const [toppings, setToppings] = useState<string[]>([]);

  if (!dish) return null;

  const toggleExcluded = (id: string) => {
    setExcluded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleTopping = (id: string) => {
    setToppings((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const total = toppings.reduce((sum, id) => {
    const t = TOPPINGS.find((x) => x.id === id);
    return t ? sum + t.price : sum;
  }, dish.basePrice);

  const addToCart = () => {
    addItem({
      id: `${dish.id}-${Date.now()}`,
      dishId: dish.id,
      name: dish.name,
      price: total,
      qty: 1,
      imageUrl: dish.imageUrl,
      addons: toppings.map((id) => {
        const t = TOPPINGS.find((x) => x.id === id)!;
        return { id: t.id, name: t.name, price: t.price };
      }),
      excluded: excluded.map((id) => {
        const ing = DEFAULT_INGREDIENTS.find((x) => x.id === id)!;
        return { id: ing.id, name: ing.name };
      }),
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="modal-close"
          aria-label="Закрыть"
        >
          ×
        </button>
        <img
          src={dish.imageUrl ?? "https://placehold.co/600x400"}
          alt={dish.name}
          style={{ width: "100%", borderRadius: 8 }}
        />
        <h2>{dish.name}</h2>
        {dish.description && <p>{dish.description}</p>}

        <h4 style={{ marginTop: 20 }}>Ингредиенты</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {DEFAULT_INGREDIENTS.map((ing) => (
            <li key={ing.id} style={{ marginBottom: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={!excluded.includes(ing.id)}
                  onChange={() => toggleExcluded(ing.id)}
                />{" "}
                {ing.name}
              </label>
            </li>
          ))}
        </ul>

        <h4 style={{ marginTop: 20 }}>Топпинги</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {TOPPINGS.map((top) => (
            <li key={top.id} style={{ marginBottom: 8 }}>
              <label>
                <input
                  type="checkbox"
                  checked={toppings.includes(top.id)}
                  onChange={() => toggleTopping(top.id)}
                />{" "}
                {top.name} (+{top.price} ₸)
              </label>
            </li>
          ))}
        </ul>

        <p style={{ fontWeight: 600 }}>Цена: {total} ₸</p>
        <button
          onClick={addToCart}
          style={{
            marginTop: 12,
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Добавить в корзину
        </button>
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

