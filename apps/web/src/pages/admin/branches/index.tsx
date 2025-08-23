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
      .then(setDishes);
  }, [branchId]);

  const toggle = async (dishId: string, available: boolean) => {
    const action = available ? "включить" : "отключить";
    if (!window.confirm(`Вы уверены, что хотите ${action} блюдо?`)) return;

    const res = await fetch(
      `${API_BASE}/admin/branches/${branchId}/dishes/${dishId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available }),
      }
    );

    if (res.ok) {
      const updated = await fetch(
        `${API_BASE}/admin/branches/${branchId}/dishes`
      ).then((r) => r.json());
      setDishes(updated);
      alert("Изменения сохранены");
    } else {
      alert("Не удалось сохранить изменения");
    }
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
                  {b.name}
                  {b.address ? ` – ${b.address}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="option-grid">
          {dishes.map((d) => (
            <button
              key={d.id}
              className={`option-btn${d.available ? " active" : ""}`}
              onClick={() => toggle(d.id, !d.available)}
            >
              {d.name}
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
