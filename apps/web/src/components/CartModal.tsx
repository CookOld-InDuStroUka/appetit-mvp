import React, { useEffect, useState } from "react";
import { useDelivery } from "./DeliveryContext";
import { useAuth } from "./AuthContext";
import UserInfoModal from "./UserInfoModal";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export type CartItem = {
  id: string; // уникальный ключ позиции в корзине
  dishId: string;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
  addons?: { id: string; name: string; price: number }[];
  excluded?: { id: string; name: string }[];
};

type Props = {
  items: CartItem[];
  onClose: () => void;
  onClear: () => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  initialPromo?: string;
};

export default function CartModal({ items, onClose, onClear, updateQty, removeItem, initialPromo }: Props) {
  const [promo, setPromo] = useState(initialPromo || "");
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [useBonus, setUseBonus] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, open: openAuth, setUser } = useAuth();
  const { mode, address, apt, entrance, floor, comment, branch, branches, pickupTime, open: openDelivery } = useDelivery();
  const [showUserInfo, setShowUserInfo] = useState(false);

  const applyPromo = async (code: string) => {
    if (!branch) return;
    try {
      const r = await fetch(`${API_BASE}/promo-codes/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, branchId: branch }),
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
  };

  useEffect(() => {
    if (initialPromo) {
      const upper = initialPromo.toUpperCase();
      setPromo(upper);
    }
  }, [initialPromo]);

  useEffect(() => {
    if (promo && branch) {
      applyPromo(promo);
    }
  }, [promo, branch]);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountAmount = Math.round((total * discount) / 100);
  const totalAfterDiscount = total - discountAmount;
  const availableBonus = user?.bonus ?? 0;
  const maxBonus = Math.max(totalAfterDiscount - 10, 0);
  const bonusToApply = useBonus ? Math.min(availableBonus, maxBonus) : 0;
  const bonusEarned = Math.floor((totalAfterDiscount - bonusToApply) * 0.1);

  const handleBackdrop = () => onClose();
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  const parseHours = (hours?: string) => {
    if (!hours) return { open: "00:00", close: "23:59", overnight: false };
    const lower = hours.toLowerCase();
    if (lower.includes("круглосуточ")) return { open: "00:00", close: "23:59", overnight: false };
    const m = hours.match(/(\d{2}:\d{2})\s*[–—−-]\s*(\d{2}:\d{2})/);
    if (m) {
      const open = m[1];
      const close = m[2];
      return { open, close, overnight: close < open };
    }
    return { open: "00:00", close: "23:59", overnight: false };
  };

  const toMin = (t: string) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3, 5));

  const isTimeAllowed = (time: string, hours?: string) => {
    const { open, close, overnight } = parseHours(hours);
    const sel = toMin(time);
    const start = toMin(open);
    const end = toMin(close);
    return overnight ? sel >= start || sel <= end : sel >= start && sel <= end;
  };

  const toAstanaISO = (time: string, branchId: string) => {
    const tz = "Asia/Almaty";
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
    let dateStr = `${get("year")}-${get("month")}-${get("day")}`;
    const branchInfo = branches.find((b) => b.id === branchId);
    const { open, overnight } = parseHours(branchInfo?.hours);
    const toMin = (t: string) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3, 5));
    const sel = toMin(time);
    const start = toMin(open);
    const timeFmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(now);
    const cur =
      parseInt(timeFmt.find((p) => p.type === "hour")?.value || "0") * 60 +
      parseInt(timeFmt.find((p) => p.type === "minute")?.value || "0");
    if (overnight && sel < start) {
      const tomorrow = new Date(now.getTime() + 86400000);
      const tp = fmt.formatToParts(tomorrow);
      dateStr = `${tp.find((p) => p.type === "year")?.value}-${tp.find((p) => p.type === "month")?.value}-${tp.find((p) => p.type === "day")?.value}`;
    } else if (sel < cur) {
      const tomorrow = new Date(now.getTime() + 86400000);
      const tp = fmt.formatToParts(tomorrow);
      dateStr = `${tp.find((p) => p.type === "year")?.value}-${tp.find((p) => p.type === "month")?.value}-${tp.find((p) => p.type === "day")?.value}`;
    }
    return `${dateStr}T${time}:00+06:00`;
  };

  const submit = async () => {
    if (!user) {
      openAuth();
      return;
    }
    if (!user.phone || !user.name) {
      setShowUserInfo(true);
      return;
    }
    if (items.length === 0) {
      return;
    }
    if (mode === "delivery" && !address) {
      alert("Укажите адрес доставки");
      openDelivery();
      return;
    }
    if (!branch) {
      alert("Выберите филиал");
      openDelivery();
      return;
    }
    if (mode === "pickup" && !pickupTime) {
      alert("Укажите желаемое время самовывоза");
      openDelivery();
      return;
    }
    if (mode === "pickup") {
      const branchInfo = branches.find((b) => b.id === branch);
      if (branchInfo && !isTimeAllowed(pickupTime, branchInfo.hours)) {
        alert(`Филиал закрыт в это время (${branchInfo.hours})`);
        openDelivery();
        return;
      }
    }
    const addr = [address, apt && `кв. ${apt}`, entrance && `подъезд ${entrance}`, floor && `этаж ${floor}`, comment]
      .filter(Boolean)
      .join(", ");
    const payload = {
      customer: { phone: user.phone, name: user.name ?? null },
      type: mode,
      zoneId: null,
      address: mode === "delivery" ? addr : null,
      branchId: branch,
      pickupTime:
        mode === "pickup" && pickupTime
          ? toAstanaISO(pickupTime, branch)
          : null,
      items: items.map((i) => ({
        dishId: i.dishId,
        variantId: null,
        qty: i.qty,
        addonIds: i.addons?.map((a) => a.id),
        exclusionIds: i.excluded?.map((e) => e.id),
      })),
      paymentMethod: payment,
      promoCode: promo || null,
      userId: user.id,
      bonusToUse: bonusToApply,
    };
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        onClear();
        onClose();
        setUser({ ...user, bonus: (user.bonus ?? 0) - data.bonusUsed + data.bonusEarned });
        alert(`Заказ создан #${data.id}`);
      } else {
        alert(data.error || "Ошибка при создании заказа");
      }
    } catch (e) {
      alert("Ошибка при создании заказа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
                  : `Самовывоз: ${
                      branches.find((b) => b.id === branch)?.name || "выбрать филиал"
                    }${pickupTime ? `, ${pickupTime}` : ""}`}
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
                  {(it.addons && it.addons.length > 0) ||
                  (it.excluded && it.excluded.length > 0) ? (
                    <div style={{ color: "var(--muted-text)", fontSize: 12 }}>
                      {it.addons?.map((a) => (
                        <div key={a.id}>+ {a.name}</div>
                      ))}
                      {it.excluded?.map((e) => (
                        <div key={e.id}>- {e.name}</div>
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
                onClick={() => applyPromo(promo)}
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

            {user && availableBonus > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={useBonus}
                  onChange={(e) => setUseBonus(e.target.checked)}
                />
                Списать бонусы (доступно {availableBonus} ₸)
              </label>
            )}

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
              {bonusToApply > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>Списано бонусов</span>
                  <span>-{bonusToApply} ₸</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                <span>Начислим бонусов</span>
                <span>{bonusEarned} ₸</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>К оплате</span>
                <span>{totalAfterDiscount - bonusToApply} ₸</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "cash"}
                  onChange={() => setPayment("cash")}
                />
                Наличными
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "card"}
                  onChange={() => setPayment("card")}
                />
                Картой
              </label>
            </div>

            <button
              onClick={submit}
              disabled={loading}
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
              {loading ? "Отправка..." : "Оформить заказ"}
            </button>
          </>
        )}
      </div>
    </div>
    {showUserInfo && user && (
      <UserInfoModal
        user={user}
        onClose={() => setShowUserInfo(false)}
        onSaved={(u) => {
          setUser(u);
          setShowUserInfo(false);
          submit();
        }}
      />
    )}
  </>
  );
}

