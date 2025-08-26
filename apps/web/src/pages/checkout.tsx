import { useEffect, useState } from "react";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

export default function Checkout() {
  const [zones, setZones] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    type: "delivery",
    phone: "",
    name: "",
    address: "",
    zoneId: "",
    items: []
  });
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applyToDelivery, setApplyToDelivery] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/zones`)
      .then((r) => r.json())
      .then(setZones)
      .catch(() => setZones([]));
  }, []);

  useEffect(() => {
    if (form.dishId) {
      fetch(`${API_BASE}/dishes/${form.dishId}`)
        .then((r) => r.json())
        .then((d) => setSubtotal(d.basePrice || 0))
        .catch(() => setSubtotal(0));
    }
  }, [form.dishId]);

  useEffect(() => {
    const z = zones.find((z) => z.id === form.zoneId);
    if (z) setDeliveryFee(Number(z.deliveryFee));
    else setDeliveryFee(0);
  }, [form.zoneId, zones]);

  const applyPromo = async () => {
    try {
      const z = zones.find((z) => z.id === form.zoneId);
      const r = await fetch(`${API_BASE}/promo-codes/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo, branchId: z?.branchId })
      });
      if (r.ok) {
        const data = await r.json();
        if (data.error) {
          setDiscount(0);
          setApplyToDelivery(false);
          alert("Промокод не найден");
        } else {
          setDiscount(data.discount);
          setApplyToDelivery(!!data.appliesToDelivery);
        }
      }
    } catch {
      setDiscount(0);
      setApplyToDelivery(false);
    }
  };

  const base = subtotal + (applyToDelivery && form.type === "delivery" ? deliveryFee : 0);
  const discountAmount = Math.round((base * discount) / 100);
  const total = subtotal + (form.type === "delivery" ? deliveryFee : 0) - discountAmount;

  const submit = async () => {
    const payload = {
      customer: { phone: form.phone, name: form.name || null },
      type: form.type,
      zoneId: form.type === "delivery" ? form.zoneId : null,
      address: form.type === "delivery" ? form.address : null,
      branchId: null,
      items: form.items.length ? form.items : [{ dishId: form.dishId, variantId: null, qty: 1 }],
      paymentMethod: "cash",
      promoCode: promo || null
    };
    try {
      const r = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      alert(r.ok ? `Заказ создан #${data.id}` : JSON.stringify(data));
    } catch (e) {
      alert("Ошибка при создании заказа");
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Оформление заказа</h1>
      <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
        <label>Телефон <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <label>Имя <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <div>
          <label><input type="radio" name="type" checked={form.type === "delivery"} onChange={() => setForm({ ...form, type: "delivery" })} /> Доставка</label>{" "}
          <label><input type="radio" name="type" checked={form.type === "pickup"} onChange={() => setForm({ ...form, type: "pickup" })} /> Самовывоз</label>
        </div>
        {form.type === "delivery" && <>
          <label>Адрес <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>
          <label>Зона доставки
            <select value={form.zoneId} onChange={e => setForm({ ...form, zoneId: e.target.value })}>
              <option value="">-- выбрать зону --</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </label>
        </>}
        <label>ID блюда для теста (из /dishes) <input value={form.dishId || ""} onChange={e => setForm({ ...form, dishId: e.target.value })} /></label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="Промокод" />
          <button onClick={applyPromo}>Применить</button>
        </div>
        <div>
          <div>Сумма: {subtotal} ₸</div>
          {discountAmount > 0 && <div>Скидка: -{discountAmount} ₸</div>}
          {form.type === "delivery" && <div>Доставка: {deliveryFee} ₸</div>}
          <div>Итого: {total} ₸</div>
        </div>
        <button onClick={submit}>Создать заказ</button>
      </div>
    </main>
  );
}
