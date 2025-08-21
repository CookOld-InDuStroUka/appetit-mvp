import { useEffect, useState } from "react";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

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

  useEffect(() => {
    fetch(`${API_BASE}/zones`).then(r => r.json()).then(setZones);
  }, []);

  const submit = async () => {
    const payload = {
      customer: { phone: form.phone, name: form.name || null },
      type: form.type,
      zoneId: form.type === "delivery" ? form.zoneId : null,
      address: form.type === "delivery" ? form.address : null,
      branchId: null,
      items: form.items.length ? form.items : [{ dishId: form.dishId, variantId: null, qty: 1 }],
      paymentMethod: "cash"
    };
    const r = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    alert(r.ok ? `Заказ создан #${data.id}` : JSON.stringify(data));
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
        <label>ID блюда для теста (из /menu) <input value={form.dishId || ""} onChange={e => setForm({ ...form, dishId: e.target.value })} /></label>
        <button onClick={submit}>Создать заказ</button>
      </div>
    </main>
  );
}
