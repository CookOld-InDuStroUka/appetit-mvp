import React, { useEffect, useState } from "react";
import DishCard from "../components/DishCard";
import DishModal from "../components/DishModal";
import Header from "../components/Header";
import MainMenu from "../components/MainMenu";
import Footer from "../components/Footer";
import PromoSlider from "../components/PromoSlider";
import MobileMenu from "../components/MobileMenu";

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
  const [sections, setSections] = useState<{ name: string; dishes: DishDTO[] }[]>([]);
  const [selectedDish, setSelectedDish] = useState<DishDTO | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const categories: any[] = await fetch(`${API_BASE}/menu/categories`).then((r) => r.json());
        const desired = ["Комбо", "Блюда", "Закуски", "Соусы", "Напитки"];
        const sectionsData = await Promise.all(
          desired.map(async (name) => {
            const cat = categories.find((c) => c.name === name);
            if (!cat) return { name, dishes: [] };
            const dishes: DishDTO[] = await fetch(
              `${API_BASE}/menu/dishes?categorySlug=${cat.slug}`
            ).then((r) => r.json());
            return { name: cat.name, dishes };
          })
        );
        setSections(sectionsData);
      } catch {
        setSections([]);
      }
    };
    load();
  }, []);

  return (
    <>
      <Header />
      <div style={{ display: "flex", width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
        <MainMenu />
        <main style={{ flex: 1, padding: "20px", boxSizing: "border-box" }}>
          <PromoSlider />
          <MobileMenu />
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
