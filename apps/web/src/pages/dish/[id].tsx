// pages/dish/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
  variants?: Variant[];
};

const fmt = new Intl.NumberFormat("ru-RU");

export default function DishPage() {
  const router = useRouter();
  const { id } = router.query;
  const dishId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // загрузка блюда
  useEffect(() => {
    if (!router.isReady || !dishId) return;
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(`${API_BASE}/dishes/${dishId}`, { signal: ac.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data: Dish = await r.json();
        setDish(data);
        setImgSrc(data.imageUrl ?? `/dishes/${data.id}.jpg`);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setErr("Не удалось загрузить блюдо.");
          setDish(null);
          setImgSrc(null);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [router.isReady, dishId]);

  // встроенная заглушка на случай битой картинки
  const FALLBACK = useMemo(
    () =>
      `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'>
           <rect width='100%' height='100%' fill='#e5e5e5'/>
           <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
                 fill='#777' font-size='48' font-family='system-ui'>Нет фото</text>
         </svg>`
      )}`,
    []
  );

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        {loading && <p>Загружаем…</p>}
        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {!loading && !err && dish && (
          <>
            <h1>{dish.name}</h1>

            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "3 / 2", // 1200x800 условно; меняй при желании
                borderRadius: 8,
                overflow: "hidden",
                background: "#eee",
                marginTop: 12,
              }}
            >
              <Image
                src={imgSrc ?? FALLBACK}
                alt={dish.name}
                fill
                sizes="(max-width: 800px) 100vw, 800px"
                style={{ objectFit: "cover" }}
                onError={() => setImgSrc(FALLBACK)}
                priority
              />
            </div>

            {dish.description && (
              <p style={{ marginTop: 16 }}>{dish.description}</p>
            )}

            <h3 style={{ marginTop: 24 }}>Цена: {fmt.format(dish.basePrice)} ₸</h3>

            {dish.variants?.length ? (
              <ul style={{ marginTop: 8 }}>
                {dish.variants.map((v) => (
                  <li key={v.id}>
                    {v.name} — {fmt.format(v.price)} ₸
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
