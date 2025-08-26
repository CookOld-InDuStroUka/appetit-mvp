import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Promo = {
  id: string;
  code: string;
  discount: number;
  appliesToDelivery: boolean;
  expiresAt: string;
  conditions?: string | null;
  maxUses?: number | null;
  usedCount: number;
  branchIds: string[];
};

type Branch = { id: string; name: string };

export default function PromoCodesAdmin() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount: 0,
    appliesToDelivery: false,
    expiresAt: "",
    maxUses: "",
    branchIds: [] as string[],
  });

  const load = async () => {
    try {
      const [codes, brs] = await Promise.all([
        fetch(`${API_BASE}/admin/promo-codes`).then((r) => r.json()),
        fetch(`${API_BASE}/branches`).then((r) => r.json()),
      ]);
      const promosData: Promo[] = codes.map((c: any) => ({
        id: c.id,
        code: c.code,
        discount: c.discount,
        appliesToDelivery: c.appliesToDelivery,
        expiresAt: c.expiresAt,
        conditions: c.conditions,
        maxUses: c.maxUses,
        usedCount: c.usedCount,
        branchIds: c.branches.map((b: Branch) => b.id),
      }));
      setPromos(promosData);
      setBranches(brs);
    } catch (err) {
      console.error("Failed to load promo codes", err);
    }
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
        code: p.code.toUpperCase(),
        discount: Number(p.discount),
        appliesToDelivery: p.appliesToDelivery,
        expiresAt: p.expiresAt,
        conditions: p.conditions ?? null,
        maxUses: p.maxUses ?? null,
        branchIds: p.branchIds,
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
        code: form.code.toUpperCase(),
        discount: Number(form.discount),
        appliesToDelivery: form.appliesToDelivery,
        expiresAt: form.expiresAt,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        branchIds: form.branchIds,
      }),
    });
    setForm({ code: "", discount: 0, appliesToDelivery: false, expiresAt: "", maxUses: "", branchIds: [] });
    load();
  };

  return (
    <AdminLayout>
      <h1>Промокоды</h1>
      <table border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Код</th>
            <th>Скидка %</th>
            <th>Действует до</th>
            <th>Макс. использований</th>
            <th>На доставку</th>
            <th>Филиалы</th>
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
                <input
                  type="checkbox"
                  checked={p.appliesToDelivery}
                  onChange={(e) => change(p.id, "appliesToDelivery", e.target.checked)}
                />
              </td>
              <td>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {branches.map((b) => (
                    <label key={b.id}>
                      <input
                        type="checkbox"
                        checked={p.branchIds.includes(b.id)}
                        onChange={(e) =>
                          change(
                            p.id,
                            "branchIds",
                            e.target.checked
                              ? [...p.branchIds, b.id]
                              : p.branchIds.filter((id) => id !== b.id)
                          )
                        }
                      />
                      {" "}
                      {b.name}
                    </label>
                  ))}
                </div>
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
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
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
        <label>
          <input
            type="checkbox"
            checked={form.appliesToDelivery}
            onChange={(e) => setForm({ ...form, appliesToDelivery: e.target.checked })}
          />
          {" На доставку"}
        </label>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {branches.map((b) => (
            <label key={b.id}>
              <input
                type="checkbox"
                checked={form.branchIds.includes(b.id)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    branchIds: e.target.checked
                      ? [...form.branchIds, b.id]
                      : form.branchIds.filter((id) => id !== b.id),
                  })
                }
              />
              {" "}
              {b.name}
            </label>
          ))}
        </div>
        <button onClick={create}>Создать</button>
      </div>
    </AdminLayout>
  );
}

