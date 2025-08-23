import { useEffect, useState } from "react";

type Branch = { id: string; name: string; address?: string };
type Dish = { id: string; name: string; available: boolean };

export default function BranchesAdmin() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    fetch("/api/v1/branches")
      .then((r) => r.json())
      .then((data: Branch[]) => {
        setBranches(data);
        if (data[0]) setBranchId(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!branchId) return;
    fetch(`/api/v1/admin/branches/${branchId}/dishes`)
      .then((r) => r.json())
      .then(setDishes);
  }, [branchId]);

  const toggle = async (dishId: string, available: boolean) => {
    await fetch(`/api/v1/admin/branches/${branchId}/dishes/${dishId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available }),
    });
    setDishes((d) => d.map((x) => (x.id === dishId ? { ...x, available } : x)));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Ассортимент филиалов</h1>
      <label>
        Филиал:
        <select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.address ? ` – ${b.address}` : ""}
            </option>
          ))}
        </select>
      </label>
      <ul>
        {dishes.map((d) => (
          <li key={d.id}>
            <label>
              <input
                type="checkbox"
                checked={d.available}
                onChange={(e) => toggle(d.id, e.target.checked)}
              />
              {" "}
              {d.name}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
