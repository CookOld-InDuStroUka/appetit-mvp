import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type Variant = { id: string; name: string; price: number };
type Dish = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  variants: Variant[];
};

export default function DishPage() {
  const router = useRouter();
  const { id } = router.query;
  const [dish, setDish] = useState<Dish | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/dishes/${id}`)
      .then((r) => r.json())
      .then((data) => setDish(data))
      .catch(() => setDish(null));
  }, [id]);

  if (!dish) return null;

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <h1>{dish.name}</h1>
        <img
          src={dish.imageUrl || "https://placehold.co/600x400"}
          alt={dish.name}
          style={{ width: "100%", borderRadius: 8 }}
        />
        {dish.description && <p style={{ marginTop: 16 }}>{dish.description}</p>}
        <h3 style={{ marginTop: 24 }}>Цена: {dish.basePrice} ₸</h3>
        {dish.variants.length > 0 && (
          <ul>
            {dish.variants.map((v) => (
              <li key={v.id}>
                {v.name} — {v.price} ₸
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
