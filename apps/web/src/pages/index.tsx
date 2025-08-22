import React, { useEffect, useMemo, useState } from "react";
import DishCard from "../components/DishCard";
import DishModal from "../components/DishModal";
import Header from "../components/Header";
import MainMenu from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";

// use local API if the env variable is missing so the menu still loads
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api/v1";

type DishDTO = {
  id: string;
  categoryId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  minPrice?: number;
  basePrice: number;
};

export default function Home() {
  const [dishes, setDishes] = useState<DishDTO[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishDTO | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then((r) => r.json())
      .then((data) => {
        setDishes(data.dishes || []);
      })
      .catch(() => {
        setDishes([]);
      });
  }, []);

  const sections = useMemo(() => {
    const base = [
      { name: "Комбо", dishes: [] as DishDTO[] },
      { name: "Блюда", dishes: dishes },
      { name: "Закуски", dishes: [] as DishDTO[] },
      { name: "Соусы", dishes: [] as DishDTO[] },
      { name: "Напитки", dishes: [] as DishDTO[] },
    ];
    return base;
  }, [dishes]);

  return (
    <>
      <Header />
      <div style={{ display: "flex", width: "100%" }}>
        <MainMenu />
        <main style={{ flex: 1, padding: "20px" }}>
          <PromoSlider />
          {sections.map((sec) => (
            <section key={sec.name} id={sec.name} style={{ marginBottom: "40px" }}>
              <h2 style={{ marginBottom: "20px" }}>{sec.name}</h2>
              {sec.dishes.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {sec.dishes.map((item) => (
                    <DishCard
                      key={item.id}
                      dish={item}
                      onClick={() => setSelectedDish(item)}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          ))}
          <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
        </main>
      </div>
      <Footer />
    </>
  );
}
