import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext";

type DishLight = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
};

type DishDetails = DishLight & {
  addons?: { id: string; name: string; price: number }[];
  exclusions?: { id: string; name: string }[];
};

type Props = {
  dish: DishLight | null;
  onClose: () => void;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function DishModal({ dish, onClose }: Props) {
  const [details, setDetails] = useState<DishDetails | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    if (dish) {
      setSelectedAddons([]);
      setExcluded([]);
      setQty(1);
      fetch(`${API_BASE}/dishes/${dish.id}`)
        .then((r) => r.json())
        .then(setDetails)
        .catch(() => setDetails(null));
    }
  }, [dish]);

  if (!dish) return null;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleExcluded = (id: string) => {
    setExcluded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = details?.addons?.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);
  const base = details?.basePrice ?? dish.basePrice;
  const total = base + addonsTotal;

  const selectedAddonObjs =
    details?.addons?.filter((a) => selectedAddons.includes(a.id)) || [];
  const selectedExcludedObjs =
    details?.exclusions?.filter((e) => excluded.includes(e.id)) || [];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close" aria-label="Закрыть">
          ×
        </button>
        <img
          src={details?.imageUrl || dish.imageUrl || "https://placehold.co/600x400"}
          alt={dish.name}
          style={{ width: "100%", borderRadius: 8 }}
        />
        <h2>{dish.name}</h2>
        {details?.description && <p>{details.description}</p>}

        {details?.addons && details.addons.length > 0 && (
          <>
            <h4 style={{ marginTop: 20 }}>Добавь вкуса</h4>
            <div className="option-grid">
              {details.addons.map((o) => (
                <button
                  key={o.id}
                  onClick={() => toggleAddon(o.id)}
                  className={`option-btn${selectedAddons.includes(o.id) ? " active" : ""}`}
                >
                  <span>{o.name}</span>
                  <span style={{ fontWeight: 600 }}>+{o.price} ₸</span>
                </button>
              ))}
            </div>
          </>
        )}

        {details?.exclusions && details.exclusions.length > 0 && (
          <>
            <h4 style={{ marginTop: 20 }}>Убери лишнее</h4>
            <div className="option-grid">
              {details.exclusions.map((ing) => (
                <button
                  key={ing.id}
                  onClick={() => toggleExcluded(ing.id)}
                  className={`option-btn${excluded.includes(ing.id) ? " active" : ""}`}
                >
                  {ing.name}
                </button>
              ))}
            </div>
          </>
        )}

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
                id:
                  dish.id +
                  JSON.stringify(selectedAddons) +
                  JSON.stringify(excluded),
                dishId: dish.id,
                name: dish.name,
                price: total,
                imageUrl: details?.imageUrl || dish.imageUrl,
                qty,
                addons: selectedAddonObjs.map((a) => ({
                  id: a.id,
                  name: a.name,
                  price: a.price,
                })),
                excluded: selectedExcludedObjs.map((e) => ({
                  id: e.id,
                  name: e.name,
                })),
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
