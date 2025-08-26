import React, { useState } from "react";
import { useCart } from "./CartContext";

type Dish = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  category?: string;
};

type Props = {
  dish: Dish | null;
  onClose: () => void;
};

type Ing = { id: string; name: string };
type Topping = { id: string; name: string; price: number };

const DEFAULT_INGREDIENTS: Ing[] = [
  { id: "no_ketchup", name: "Без кетчупа" },
  { id: "no_fries", name: "Без фри" },
  { id: "no_meat", name: "Без мяса" },
  { id: "no_onion", name: "Без лука" },
  { id: "no_mayo", name: "Без майонеза" },
  { id: "no_tomato", name: "Без помидор" },
];

const TOPPINGS: Topping[] = [
  { id: "mustard", name: "соус Горчичный во внутрь", price: 240 },
  { id: "bbq", name: "соус Барбекю во внутрь", price: 240 },
  { id: "cheese_sauce", name: "соус Сырный во внутрь", price: 240 },
  { id: "hot_pepper", name: "перчики острые во внутрь", price: 240 },
  { id: "tomato_sauce", name: "соус Томатный во внутрь", price: 240 },
  { id: "spicy_sauce", name: "соус Острый во внутрь", price: 240 },
  { id: "garlic_sauce", name: "соус Чесночный во внутрь", price: 240 },
];

export default function DishModal({ dish, onClose }: Props) {
  const { addItem } = useCart();
  const [excluded, setExcluded] = useState<string[]>([]);
  const [toppings, setToppings] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

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

  const unitPrice = toppings.reduce((sum, id) => {
    const t = TOPPINGS.find((x) => x.id === id);
    return t ? sum + t.price : sum;
  }, dish.basePrice);
  const total = unitPrice * qty;

  const addToCart = () => {
    addItem({
      id: `${dish.id}-${Date.now()}`,
      dishId: dish.id,
      name: dish.name,
      price: unitPrice,
      qty,
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
        <button onClick={onClose} className="modal-close" aria-label="Закрыть">
          ×
        </button>
        <img
          src={dish.imageUrl ?? "https://placehold.co/600x400"}
          alt={dish.name}
          style={{ width: "100%", borderRadius: 8 }}
        />
        <h2>{dish.name}</h2>
        {dish.description && <p>{dish.description}</p>}

        <h4 style={{ marginTop: 20 }}>Добавь вкуса</h4>
        <div className="option-grid">
          {TOPPINGS.map((top) => (
            <button
              key={top.id}
              className={`option-btn ${toppings.includes(top.id) ? "active" : ""}`}
              onClick={() => toggleTopping(top.id)}
            >
              <span>{top.name}</span>
              <span style={{ fontWeight: 600 }}>+{top.price} ₸</span>
            </button>
          ))}
        </div>

        <h4 style={{ marginTop: 20 }}>Убери лишнее</h4>
        <div className="option-grid">
          {DEFAULT_INGREDIENTS.map((ing) => (
            <button
              key={ing.id}
              className={`option-btn ${excluded.includes(ing.id) ? "active" : ""}`}
              onClick={() => toggleExcluded(ing.id)}
            >
              {ing.name}
            </button>
          ))}
        </div>

        <div
          style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}
        >
          <button
            className="option-btn"
            aria-label="Уменьшить"
            style={{ width: 32, height: 32, padding: 0 }}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            –
          </button>
          <span>{qty}</span>
          <button
            className="option-btn"
            aria-label="Увеличить"
            style={{ width: 32, height: 32, padding: 0 }}
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
          <div style={{ marginLeft: "auto", fontWeight: 600 }}>{total} ₸</div>
          <button className="add-btn" aria-label="Добавить" onClick={addToCart}>
            В корзину
          </button>
        </div>
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

        .option-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 8px;
        }

        .option-btn {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
        }

        .option-btn.active {
          background: #e0e7ff;
          border-color: #6366f1;
        }

        .add-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

