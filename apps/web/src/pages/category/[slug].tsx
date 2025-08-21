import { useRouter } from "next/router";
import { useEffect, useState } from "react";
type DishDTO = {
  id: string;
  name: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [dishes, setDishes] = useState<DishDTO[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/menu?categorySlug=${slug}`)
      .then(r => r.json())
      .then(data => setDishes(data.dishes || []));
  }, [slug]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Категория: {slug}</h1>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {dishes.map(d => (
          <article key={d.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <img src={d.imageUrl || "https://placehold.co/320x180"} alt={d.name} style={{ width: "100%", borderRadius: 8 }} />
            <h3>{d.name}</h3>
            <strong>{d.minPrice ? `от ${d.minPrice} ₸` : `${d.basePrice} ₸`}</strong>
          </article>
        ))}
      </section>
    </main>
  );
}
