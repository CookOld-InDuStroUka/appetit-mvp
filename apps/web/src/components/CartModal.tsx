import React, { useState } from "react";
import { useDelivery } from "./DeliveryContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
  addons?: { name: string; price: number }[];
  excluded?: string[];
};

type Props = {
  items: CartItem[];
  onClose: () => void;
  onClear: () => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
};

export default function CartModal({ items, onClose, onClear, updateQty, removeItem }: Props) {
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const { mode, address, branch, branches, open: openDelivery } = useDelivery();

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = Math.round(total * discount / 100);
  const totalAfterDiscount = total - discountAmount;
  const bonuses = Math.floor(totalAfterDiscount * 0.1);

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
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--muted-text)",
                fontSize: 24,
                width: 32,
                height: 32,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
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
              <button
                onClick={openDelivery}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {mode === "delivery"
                  ? `Доставка: ${address || "указать адрес"}`
                  : `Самовывоз: ${branches.find((b) => b.id === branch)?.name || "выбрать филиал"}`}
              </button>
            </div>

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
                  {(it.addons && it.addons.length > 0) || (it.excluded && it.excluded.length > 0) ? (
                    <div style={{ color: "var(--muted-text)", fontSize: 12 }}>
                      {it.addons?.map((a) => (
                        <div key={a.name}>+ {a.name}</div>
                      ))}
                      {it.excluded?.map((e) => (
                        <div key={e}>- {e}</div>
                      ))}
                    </div>
                  ) : null}
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
                name="promo"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
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
                onClick={async () => {
                  try {
                    const r = await fetch(`${API_BASE}/promo-codes/check`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ code: promo, branchId: branch }),
                    });
                    if (r.ok) {
                      const data = await r.json();
                      setDiscount(data.discount);
                    } else {
                      setDiscount(0);
                      alert("Промокод не найден");
                    }
                  } catch {
                    setDiscount(0);
                  }
                }}
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
              {discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Скидка</span>
                  <span>-{discountAmount} ₸</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                <span>Бонусы</span>
                <span>{bonuses} ₸</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>К оплате</span>
                <span>{totalAfterDiscount - bonuses} ₸</span>
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

