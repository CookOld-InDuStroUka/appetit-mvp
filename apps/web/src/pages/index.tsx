import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import MainMenu, { CategoryLink } from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

type DishDTO = {
  id: string;
  categoryId: string;
  name: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
};

export default function Home() {
  const [categories, setCategories] = useState<CategoryLink[]>([]);
  const [dishes, setDishes] = useState<DishDTO[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
        setDishes(data.dishes || []);
      });
  }, []);

  const grouped = categories.map((c) => ({
    ...c,
    dishes: dishes.filter((d) => d.categoryId === c.id),
  }));

  return (
    <>
      <Header />
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex" }}>
        <MainMenu categories={categories} />
        <main style={{ flex: 1, padding: "20px" }}>
          <PromoSlider />
          {grouped.map((cat) => (
            <section key={cat.id} id={cat.slug ?? cat.id} style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "20px" }}>{cat.name}</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
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
