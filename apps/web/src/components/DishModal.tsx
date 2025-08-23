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

const ADD_ONS = [
  { name: "соус Горчичный", price: 240 },
  { name: "соус Барбекю", price: 240 },
  { name: "соус Сырный", price: 240 },
  { name: "перчик острый", price: 240 },
  { name: "соус Томатный", price: 240 },
  { name: "соус Чесночный", price: 240 },
];

const REMOVE_ING = [
  "без кетчупа",
  "без майонеза",
  "без лука",
  "без помидор",
  "без огурцов",
  "без мяса",
];

export default function DishModal({ dish, onClose }: Props) {
  const [excluded, setExcluded] = useState<string[]>([]);
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  if (!dish) return null;

  const toggleExcluded = (ing: string) => {
    setExcluded((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const toggleAddon = (name: string) => {
    setAddons((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const addonsTotal = addons.reduce((sum, a) => {
    const item = ADD_ONS.find((o) => o.name === a);
    return sum + (item ? item.price : 0);
  }, 0);
  const total = dish.basePrice + addonsTotal;

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

        <h4 style={{ marginTop: 20 }}>Добавь вкуса</h4>
        <div className="option-grid">
          {ADD_ONS.map((o) => (
            <button
              key={o.name}
              onClick={() => toggleAddon(o.name)}
              className={`option-btn${addons.includes(o.name) ? " active" : ""}`}
            >
              <span>{o.name}</span>
              <span style={{ fontWeight: 600 }}>+{o.price} ₸</span>
            </button>
          ))}
        </div>

        <h4 style={{ marginTop: 20 }}>Убери лишнее</h4>
        <div className="option-grid">
          {REMOVE_ING.map((ing) => (
            <button
              key={ing}
              onClick={() => toggleExcluded(ing)}
              className={`option-btn${excluded.includes(ing) ? " active" : ""}`}
            >
              {ing}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="option-btn"
            aria-label="Уменьшить"
            style={{ width: 32, height: 32, padding: 0 }}
          >
            –
          </button>
          <span>{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="option-btn"
            aria-label="Увеличить"
            style={{ width: 32, height: 32, padding: 0 }}
          >
            +
          </button>
          <div style={{ marginLeft: "auto", fontWeight: 600 }}>{total * qty} ₸</div>
          <button
            onClick={() =>
              addItem({
                id: dish.id,
                name: dish.name,
                price: total,
                imageUrl: dish.imageUrl,
                qty,
              })
            }
            className="add-btn"
            aria-label="Добавить"
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
