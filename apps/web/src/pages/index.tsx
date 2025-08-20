import { useEffect, useState } from "react";
import type { DishDTO } from "@appetit/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function Home() {
  const [q, setQ] = useState("");
  const [dishes, setDishes] = useState<DishDTO[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then(r => r.json())
      .then(data => setDishes(data.dishes || []))
      .catch(() => setDishes([]));
  }, []);

  const search = async () => {
    const r = await fetch(`${API_BASE}/menu?q=${encodeURIComponent(q)}`);
    const data = await r.json();
    setDishes(data.dishes || []);
  };

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>APPETIT</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по блюдам" />
        <button onClick={search}>Искать</button>
      </div>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {dishes.map(d => (
          <article key={d.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12, boxShadow: "0 2px 6px rgba(0,0,0,.06)" }}>
            <img src={d.imageUrl || "https://placehold.co/320x180"} alt={d.name} style={{ width: "100%", borderRadius: 8 }} />
            <h3>{d.name}</h3>
            {d.description && <p style={{ color: "#555" }}>{d.description}</p>}
            <strong>{d.minPrice ? `от ${d.minPrice} ₸` : `${d.basePrice} ₸`}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
