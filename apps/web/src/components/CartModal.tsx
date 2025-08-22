import React, { useState } from "react";
import DeliveryMap from "./DeliveryMap";

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

export default function CartModal({ items, onClose, onClear, updateQty, removeItem }: Props) {
  const [type, setType] = useState<"delivery" | "pickup">("delivery");
  const [branch, setBranch] = useState("САМАРСКОЕ ШОССЕ, 5/1");
  const [promo, setPromo] = useState("");

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
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setType("delivery")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: type === "delivery" ? "var(--accent)" : "var(--card-bg)",
                  color: type === "delivery" ? "#fff" : "var(--text)",
                  cursor: "pointer",
                }}
              >
                Доставка
              </button>
              <button
                onClick={() => setType("pickup")}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: type === "pickup" ? "var(--accent)" : "var(--card-bg)",
                  color: type === "pickup" ? "#fff" : "var(--text)",
                  cursor: "pointer",
                }}
              >
                Самовывоз
              </button>
            </div>
            {type === "delivery" && (
              <div style={{ marginBottom: 16 }}>
                <DeliveryMap />
              </div>
            )}
            {type === "pickup" && (
              <div style={{ marginBottom: 16 }}>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card-bg)",
                    color: "var(--text)",
                  }}
                >
                  <option value="САМАРСКОЕ ШОССЕ, 5/1">САМАРСКОЕ ШОССЕ, 5/1</option>
                </select>
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

            <div style={{ marginBottom: 16 }}>
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Промокод"
                style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text)" }}
              />
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Товары в заказе {items.length} шт.</span>
                <span>{total} ₸</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Бонусы к начислению</span>
                <span style={{ color: "#16a34a" }}>+{bonuses} ₸</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>Итого</span>
                <span>{total} ₸</span>
              </div>
            </div>

            <a
              href="/checkout"
              style={{
                display: "block",
                textAlign: "center",
                background: "var(--accent)",
                color: "#fff",
                padding: "12px 0",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Продолжить оформление
            </a>
          </>
        )}
      </div>
    </div>
  );
}

