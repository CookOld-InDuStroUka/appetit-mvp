import { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://appetit.duckdns.org/api/v1";

type Branch = { id: string; name: string; address?: string };
type Dish = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  available: boolean;
};

export default function BranchesAdmin() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [original, setOriginal] = useState<Dish[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/branches`)
      .then((r) => r.json())
      .then((data: Branch[]) => {
        setBranches(data);
        if (data[0]) setBranchId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!branchId) return;
    fetch(`${API_BASE}/admin/branches/${branchId}/dishes`)
      .then((r) => r.json())
      .then((data: Dish[]) => {
        setDishes(data);
        setOriginal(data);
        setDirty(false);
      });
  }, [branchId]);

  const toggle = (dishId: string) => {
    setDishes((prev) =>
      prev.map((d) => (d.id === dishId ? { ...d, available: !d.available } : d))
    );
    setDirty(true);
  };

  const save = async () => {
    if (!dirty) return;
    if (!window.confirm("Применить изменения?")) return;

    const updates = dishes.filter((d) => {
      const orig = original.find((o) => o.id === d.id);
      return orig && orig.available !== d.available;
    });

    for (const u of updates) {
      await fetch(`${API_BASE}/admin/branches/${branchId}/dishes/${u.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: u.available }),
      });
    }

    const fresh = await fetch(
      `${API_BASE}/admin/branches/${branchId}/dishes`
    ).then((r) => r.json());
    setDishes(fresh);
    setOriginal(fresh);
    setDirty(false);
    alert("Изменения сохранены");
  };

  return (
    <AdminLayout>
      <section className="branch-assort">
        <h1 className="page-title">Ассортимент филиалов</h1>

        <div className="branch-toolbar">
          <label htmlFor="branch" className="toolbar-label">Филиал:</label>
          <div className="select-wrap">
            <select
              id="branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="select"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.address ?? b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {Object.entries(
          dishes.reduce<Record<string, Dish[]>>((acc, d) => {
            (acc[d.categoryName] ||= []).push(d);
            return acc;
          }, {})
        ).map(([cat, items]) => (
          <section key={cat} className="cat-block">
            <h3 className="cat-title">{cat}</h3>
            <div className="option-grid">
              {items.map((d) => (
                <button
                  key={d.id}
                  className={`option-btn${d.available ? " active" : ""}`}
                  onClick={() => toggle(d.id)}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </section>
        ))}

        <div className="save-row">
          <button onClick={save} disabled={!dirty} className="save-btn">
            Подтвердить изменения
          </button>
        </div>
      </section>

      {/* === СТИЛИ НА МЕСТЕ (styled-jsx) === */}
      <style jsx>{`
        .branch-assort {
          width: 100%;
          max-width: 1120px;
          margin: 24px auto 96px;
          padding: 0 clamp(16px, 4vw, 28px);
        }

        .page-title {
          margin: 0 0 16px;
          font-size: clamp(22px, 2.6vw, 34px);
          line-height: 1.2;
          color: var(--text);
        }

        /* верхняя панель: стекло + аккуратный select */
        .branch-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04)), var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 6px 16px rgba(0,0,0,.06);
          margin-bottom: 10px;
        }
        .toolbar-label {
          min-width: 64px;
          color: var(--muted-text);
          font-weight: 600;
        }
        .select-wrap { position: relative; }
        .select {
          appearance: none;
          -webkit-appearance: none;
          background: var(--input-bg);
          color: var(--text);
          border: 1px solid var(--input-border);
          border-radius: 10px;
          padding: 10px 40px 10px 12px;
          outline: none;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
        }
        /* стрелочка у select */
        .select-wrap::after {
          content: "";
          position: absolute;
          right: 12px; top: 50%; transform: translateY(-50%);
          width: 20px; height: 20px; pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
          background-repeat: no-repeat;
          opacity: .8;
        }

        /* блоки категорий */
        .cat-block { margin: 22px 0; padding: 6px 0 2px; }
        .cat-title {
          margin: 0 0 10px;
          font-weight: 800;
          font-size: 16px;
          color: var(--text);
          letter-spacing: .2px;
          position: relative;
        }
        .cat-title::after {
          content: "";
          display: block;
          height: 1px;
          background: var(--border);
          opacity: .6;
          margin-top: 8px;
        }

        /* сетка чипов */
        .option-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .option-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(97,163,91,.45);
          background: color-mix(in oklab, var(--accent) 10%, var(--card-bg));
          color: var(--text);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: transform .12s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease, color .15s ease;
          box-shadow: 0 1px 0 rgba(0,0,0,.04);
        }
        .option-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(97,163,91,.65);
          background: color-mix(in oklab, var(--accent) 14%, var(--card-bg));
          box-shadow: 0 6px 14px rgba(0,0,0,.08);
        }
        .option-btn.active {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          box-shadow: 0 6px 16px rgba(97,163,91,.35);
        }
        .option-btn.active::before {
          content: "✓";
          font-weight: 800;
          margin-right: 2px;
        }

        /* липкая панель сохранения */
        .save-row {
          position: sticky;
          bottom: 16px;
          padding-top: 8px;
        }
        .save-btn {
          padding: 12px 22px;
          border-radius: 12px;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 22px rgba(97,163,91,.28);
          transition: transform .12s ease, box-shadow .15s ease, filter .15s ease, opacity .15s ease;
        }
        .save-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 26px rgba(97,163,91,.36); }
        .save-btn:disabled {
          background: var(--input-bg);
          color: var(--muted-text);
          border-color: var(--border);
          cursor: not-allowed;
          box-shadow: none;
          opacity: .8;
        }

        @media (max-width: 720px) {
          .branch-toolbar { flex-wrap: wrap; gap: 8px; }
          .toolbar-label { min-width: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .option-btn, .save-btn { transition: none !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
