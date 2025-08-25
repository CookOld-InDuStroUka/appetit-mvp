import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Promo = {
  id: string;
  code: string;
  discount: number;
  expiresAt: string;
  conditions?: string | null;
  maxUses?: number | null;
  usedCount: number;
  branchId?: string | null;
};

type Branch = { id: string; name: string };

export default function PromoCodesAdmin() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount: 0,
    expiresAt: "",
    maxUses: "",
    branchId: "",
  });

  const load = async () => {
    const [codes, brs] = await Promise.all([
      fetch(`${API_BASE}/admin/promo-codes`).then((r) => r.json()),
      fetch(`${API_BASE}/branches`).then((r) => r.json()),
    ]);
    setPromos(codes);
    setBranches(brs);
  };

  useEffect(() => {
    load();
  }, []);

  const change = (id: string, field: keyof Promo, value: any) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const save = async (p: Promo) => {
    await fetch(`${API_BASE}/admin/promo-codes/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: p.code,
        discount: Number(p.discount),
        expiresAt: p.expiresAt,
        conditions: p.conditions ?? null,
        maxUses: p.maxUses ?? null,
        branchId: p.branchId ?? null,
      }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Удалить промокод?")) return;
    await fetch(`${API_BASE}/admin/promo-codes/${id}`, { method: "DELETE" });
    load();
  };

  const create = async () => {
    await fetch(`${API_BASE}/admin/promo-codes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        discount: Number(form.discount),
        expiresAt: form.expiresAt,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        branchId: form.branchId || null,
      }),
    });
    setForm({ code: "", discount: 0, expiresAt: "", maxUses: "", branchId: "" });
    load();
  };

  return (
    <div style={{ padding: 24 }}>
      <p><Link href="/admin/promos">← Назад</Link></p>
      <h1>Промокоды</h1>
      <table border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Код</th>
            <th>Скидка %</th>
            <th>Действует до</th>
            <th>Макс. использований</th>
            <th>Филиал</th>
            <th>Использовано</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {promos.map((p) => (
            <tr key={p.id}>
              <td>{p.code}</td>
              <td>
                <input
                  type="number"
                  value={p.discount}
                  onChange={(e) => change(p.id, "discount", Number(e.target.value))}
                  style={{ width: 60 }}
                />
              </td>
              <td>
                <input
                  type="date"
                  value={p.expiresAt.slice(0, 10)}
                  onChange={(e) =>
                    change(p.id, "expiresAt", new Date(e.target.value).toISOString())
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={p.maxUses ?? ""}
                  onChange={(e) =>
                    change(p.id, "maxUses", e.target.value ? Number(e.target.value) : null)
                  }
                  style={{ width: 80 }}
                />
              </td>
              <td>
                <select
                  value={p.branchId ?? ""}
                  onChange={(e) => change(p.id, "branchId", e.target.value || null)}
                >
                  <option value="">— любой —</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>{p.usedCount}</td>
              <td>
                <button onClick={() => save(p)}>💾</button>{" "}
                <button onClick={() => remove(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 24 }}>Создать</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Код"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          type="number"
          placeholder="Скидка %"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
          style={{ width: 80 }}
        />
        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
        />
        <input
          type="number"
          placeholder="Макс. использований"
          value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
          style={{ width: 80 }}
        />
        <select
          value={form.branchId}
          onChange={(e) => setForm({ ...form, branchId: e.target.value })}
        >
          <option value="">— любой —</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button onClick={create}>Создать</button>
      </div>
    </div>
  );
}

