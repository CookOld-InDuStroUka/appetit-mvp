import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Branch = { id: string; name: string; address?: string };
type Dish = { id: string; name: string; available: boolean };

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
      await fetch(
        `${API_BASE}/admin/branches/${branchId}/dishes/${u.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ available: u.available }),
        }
      );
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
    <>
      <Header />
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>Ассортимент филиалов</h1>
        <div style={{ marginBottom: 24 }}>
          <label>
            Филиал:
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--input-border)",
                background: "var(--input-bg)",
                color: "var(--text)",
                marginLeft: 8,
              }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.address ?? b.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="option-grid" style={{ marginBottom: 24 }}>
          {dishes.map((d) => (
            <button
              key={d.id}
              className={`option-btn${d.available ? " active" : ""}`}
              onClick={() => toggle(d.id)}
            >
              {d.name}
            </button>
          ))}
        </div>
        <button
          onClick={save}
          disabled={!dirty}
          style={{
            padding: "10px 24px",
            borderRadius: 8,
            background: dirty ? "var(--primary)" : "var(--input-bg)",
            color: dirty ? "#fff" : "var(--text)",
            border: "none",
            cursor: dirty ? "pointer" : "not-allowed",
          }}
        >
          Подтвердить изменения
        </button>
      </main>
      <Footer />
    </>
  );
}
