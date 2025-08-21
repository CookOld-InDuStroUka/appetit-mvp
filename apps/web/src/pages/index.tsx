import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import MainMenu from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";

// use local API if the env variable is missing so the menu still loads
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type CategoryDTO = {
  id: string;
  name: string;
};

type DishDTO = {
  id: string;
  categoryId: string;
  name: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
};

export default function Home() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [dishes, setDishes] = useState<DishDTO[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setDishes(data.dishes || []);
      })
      .catch(() => {
        setCategories([]);
        setDishes([]);
      });
  }, []);

  const grouped = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        dishes: dishes.filter((d) => d.categoryId === c.id),
      })),
    [categories, dishes]
  );

  return (
    <>
      <Header />
      <div style={{ display: "flex", width: "100%" }}>
        <MainMenu />
        <main style={{ flex: 1, padding: "20px" }}>
          <PromoSlider />
          {grouped.map((cat) => (
            <section key={cat.id} id={cat.name} style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "20px" }}>{cat.name}</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "20px",
                }}
              >
                {cat.dishes.map((item) => (
                  <Link
                    key={item.id}
                    href={`/dish/${item.id}`}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      padding: "15px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <img
                      src={item.imageUrl || "https://placehold.co/320x180"}
                      alt={item.name}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                    <h4 style={{ margin: "10px 0" }}>{item.name}</h4>
                    <p style={{ color: "#666", fontSize: "14px" }}>
                      {item.minPrice ? `от ${item.minPrice} ₸` : `${item.basePrice} ₸`}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
      <Footer />
    </>
  );
}
