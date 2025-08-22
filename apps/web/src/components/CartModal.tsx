import React, { useState } from "react";
import DeliveryMap from "./DeliveryMap";
import PickupMap, { Branch } from "./PickupMap";
import DeliveryToggle from "./DeliveryToggle";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
};

type Props = {
  items: CartItem[];
  onClose: () => void;
  onClear: () => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
};

const BRANCHES: Branch[] = [
  { id: "kazakhstan", name: "КАЗАХСТАН, 70А", coords: [49.963, 82.605] },
  { id: "satpaeva", name: "САТПАЕВА, 8А", coords: [49.967, 82.640] },
  { id: "novatorov", name: "НОВАТОРОВ, 18/2", coords: [49.955, 82.620] },
  { id: "zhybek", name: "ЖИБЕК ЖОЛЫ, 1к8", coords: [49.943, 82.630] },
  { id: "samarskoe", name: "САМАРСКОЕ ШОССЕ, 5/1", coords: [49.935, 82.605] },
  { id: "kabanbay", name: "КАБАНБАЙ БАТЫРА,148", coords: [49.955, 82.650] },
  { id: "nazarbaeva", name: "НАЗАРБАЕВА, 28А", coords: [49.978, 82.650] },
];

export default function CartModal({ items, onClose, onClear, updateQty, removeItem }: Props) {
  const [promo, setPromo] = useState("");
  const [type, setType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [apt, setApt] = useState("");
  const [comment, setComment] = useState("");
  const [branch, setBranch] = useState(BRANCHES[0].id);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const bonuses = Math.floor(total * 0.1);

  const handleBackdrop = () => onClose();
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={stopProp}>
        <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>Корзина</h2>
          <div style={{ position: "absolute", right: 0, top: 0, display: "flex", gap: 8 }}>
            {items.length > 0 && (
              <button
                onClick={onClear}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
                aria-label="Очистить корзину"
              >
                🗑️
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-text)" }}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Ваша корзина пуста</p>
            <p style={{ marginBottom: 24 }}>Загляните в меню и наполните её прямо сейчас любимыми блюдами!</p>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                borderRadius: 8,
                background: "var(--input-bg)",
                color: "var(--header-text)",
                textDecoration: "none",
              }}
            >
              Перейти в меню
            </a>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <DeliveryToggle value={type} onChange={setType} />
            </div>

            {type === "delivery" && (
              <div style={{ marginBottom: 16 }}>
                <DeliveryMap address={address} setAddress={setAddress} height={300} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <input
                    value={apt}
                    onChange={(e) => setApt(e.target.value)}
                    placeholder="Квартира/офис"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--card-bg)",
                    }}
                  />
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Комментарий"
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--card-bg)",
                    }}
                  />
                </div>
              </div>
            )}

            {type === "pickup" && (
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  {BRANCHES.map((b) => (
                    <label key={b.id} style={{ display: "block", marginBottom: 8, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="branch"
                        value={b.id}
                        checked={branch === b.id}
                        onChange={() => setBranch(b.id)}
                        style={{ marginRight: 8 }}
                      />
                      {b.name}
                    </label>
                  ))}
                  <p style={{ fontSize: 14, color: "var(--muted-text)" }}>Ассортимент филиалов может отличаться.</p>
                </div>
                <PickupMap branches={BRANCHES} selected={branch} onSelect={setBranch} height={300} />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {items.map((it) => (
                <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={it.imageUrl || "https://placehold.co/60x60"}
                    alt={it.name}
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{it.name}</div>
                    <div style={{ color: "var(--muted-text)", fontSize: 14 }}>{it.price} ₸</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => updateQty(it.id, it.qty - 1)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        background: "var(--card-bg)",
                        cursor: "pointer",
                      }}
                      aria-label="Уменьшить"
                    >
                      –
                    </button>
                    <span>{it.qty}</span>
                    <button
                      onClick={() => updateQty(it.id, it.qty + 1)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        background: "var(--card-bg)",
                        cursor: "pointer",
                      }}
                      aria-label="Увеличить"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(it.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--muted-text)",
                        fontSize: 16,
                      }}
                      aria-label="Удалить"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Промокод"
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                }}
              />
              <button
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                  cursor: "pointer",
                }}
              >
                Применить
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Итого</span>
                <span>{total} ₸</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                <span>Бонусы</span>
                <span>{bonuses} ₸</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>К оплате</span>
                <span>{total - bonuses} ₸</span>
              </div>
            </div>

            <button
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Оформить заказ
            </button>
          </>
        )}
      </div>
    </div>
  );
}

